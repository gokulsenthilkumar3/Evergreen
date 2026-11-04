import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { monetaryFields } from './postgres-schema.mjs';
import os from 'node:os';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const { PrismaClient: SqliteClient, Prisma } = require('@prisma/client');
const delegate = name => name[0].toLowerCase() + name.slice(1);
const quote = name => '"' + name.replaceAll('"', '""') + '"';

/** Explicit, one-way copy into an EMPTY, already-migrated destination. Never writes the source. */
export async function migratePostgres({ sourceFile, targetUrl, execute = false, sourceStopped = false }) {
  if (!sourceFile || !path.isAbsolute(sourceFile) || !fs.existsSync(sourceFile)) throw new Error('Supply an existing absolute SQLite source file');
  if (!/^postgres(?:ql)?:\/\//.test(targetUrl || '')) throw new Error('Supply an explicit PostgreSQL destination URL');
  if (execute && !sourceStopped) throw new Error('Stop source writes and acknowledge --source-stopped before executing a migration');
  const wal = `${sourceFile}-wal`;
  if (fs.existsSync(wal) && fs.statSync(wal).size > 0) throw new Error('Use a consistent SQLite snapshot; the source has an outstanding WAL');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-migration-read-'));
  let source;
  let destination;
  try {
  const snapshot = path.join(scratch, 'source.db');
  const checksum = () => createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex');
  const before = checksum();
  fs.copyFileSync(sourceFile, snapshot);
  if (checksum() !== before || (fs.existsSync(wal) && fs.statSync(wal).size > 0)) {
    throw new Error('Source changed while taking the read snapshot; stop writes and retry');
  }
  const { PrismaClient: PostgresClient } = require('../../packages/database/generated/postgres');
  // Prisma may initialize connection pragmas; it only opens our disposable copy.
  source = new SqliteClient({ datasources: { db: { url: `file:${snapshot}` } } });
  destination = new PostgresClient({ datasources: { db: { url: targetUrl } } });
  const models = Prisma.dmmf.datamodel.models;
    const integrity = await source.$queryRawUnsafe('PRAGMA integrity_check');
    if (integrity.length !== 1 || Object.values(integrity[0])[0] !== 'ok') throw new Error('Source snapshot failed integrity check');
    const tables = await source.$transaction(async tx => {
      const result = [];
      for (const model of models) {
        const rows = await tx[delegate(model.name)].findMany();
        const decimals = model.fields.filter(field => field.type === 'Float');
        const sums = Object.fromEntries(decimals.map(field => [field.name, new Prisma.Decimal(0)]));
        let roundedValues = 0;
        const data = rows.map(row => {
          const converted = { ...row };
          for (const field of decimals) {
            if (row[field.name] === null) continue;
            const original = new Prisma.Decimal(row[field.name]);
            const normalized = original.toDecimalPlaces(monetaryFields.has(field.name) ? 2 : 6);
            if (!normalized.equals(original)) roundedValues++;
            converted[field.name] = normalized.toFixed(monetaryFields.has(field.name) ? 2 : 6);
            sums[field.name] = sums[field.name].plus(normalized);
          }
          return converted;
        });
        result.push({ model, data, roundedValues, sums });
      }
      return result;
    }, { timeout: 300_000 });
    const report = { executed: execute, sourceReadOnly: true, tables: [] };
    await destination.$transaction(async tx => {
      for (const { model } of tables) {
        if (await tx[delegate(model.name)].count() !== 0) throw new Error(`Destination must be empty: ${model.name} contains records`);
      }
      if (execute) await tx.$executeRawUnsafe('SET CONSTRAINTS ALL DEFERRED');
      for (const { model, data, roundedValues, sums } of tables) {
        const modelClient = tx[delegate(model.name)];
        if (execute) {
          for (let offset = 0; offset < data.length; offset += 250) {
            await modelClient.createMany({ data: data.slice(offset, offset + 250) });
          }
          if (await modelClient.count() !== data.length) throw new Error(`Count mismatch: ${model.name}`);
          for (const [field, sum] of Object.entries(sums)) {
            const actual = (await modelClient.aggregate({ _sum: { [field]: true } }))._sum[field] || new Prisma.Decimal(0);
            if (!sum.equals(actual)) throw new Error(`Decimal total mismatch: ${model.name}.${field}`);
          }
          const id = model.fields.find(field => field.isId && field.default?.name === 'autoincrement');
          if (id) {
            // Identifiers come only from generated Prisma metadata, never CLI/user strings.
            const table = quote(model.dbName || model.name);
            const column = quote(id.dbName || id.name);
            await tx.$queryRawUnsafe(`SELECT setval(pg_get_serial_sequence($1, $2), COALESCE(MAX(${column}), 1), COUNT(*) > 0) FROM ${table}`, table, id.dbName || id.name);
          }
        }
        report.tables.push({ name: model.name, rows: data.length, roundedValues,
          decimalTotals: Object.fromEntries(Object.entries(sums).map(([field, sum]) => [field, sum.toString()])) });
      }
    }, { timeout: 300_000 });
    return report;
  } finally {
    await Promise.allSettled([source?.$disconnect(), destination?.$disconnect()]);
    const resolved = fs.realpathSync(scratch);
    if (path.dirname(resolved) !== fs.realpathSync(os.tmpdir()) || !path.basename(resolved).startsWith('evergreen-migration-read-')) {
      throw new Error('Unexpected migration scratch path');
    }
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const value = key => args[args.indexOf(key) + 1];
  try {
    if (!args.includes('--source') || !process.env.POSTGRES_MIGRATION_URL) throw new Error('Use --source ABSOLUTE_FILE and POSTGRES_MIGRATION_URL; --execute --source-stopped enables writes to an empty destination');
    const report = await migratePostgres({ sourceFile: value('--source'), targetUrl: process.env.POSTGRES_MIGRATION_URL,
      execute: args.includes('--execute'), sourceStopped: args.includes('--source-stopped') });
    if (args.includes('--report')) fs.writeFileSync(value('--report'), JSON.stringify(report, null, 2) + '\n');
    console.log(`Migration ${report.executed ? 'copied and verified' : 'dry run'}: ${report.tables.length} tables, ${report.tables.reduce((sum, table) => sum + table.rows, 0)} rows. Source unchanged.`);
  } catch (error) {
    // Driver errors may contain connection strings or record contents; never echo them.
    console.error(`Migration failed; no successful destination commit was recorded. ${error.code ? `Code: ${error.code}` : 'Check the empty-target, stopped-source and schema prerequisites.'}`);
    process.exitCode = 1;
  }
}
