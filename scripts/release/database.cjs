// Shared by desktop packages and containers. No application environment is loaded.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawn } = require('node:child_process');

function databaseUrl(file) {
  return `file:${path.resolve(file).replaceAll('\\', '/')}`;
}

function client(root, file, plane = 'tenant') {
  const modulePath = plane === 'provider' ? '@prisma/admin-client' : '@prisma/client';
  const { PrismaClient } = require(require.resolve(modulePath, { paths: [root] }));
  return new PrismaClient({ datasources: { db: { url: databaseUrl(file) } } });
}

async function inspect(root, file, plane = 'tenant') {
  const db = client(root, file, plane);
  try {
    const integrity = await db.$queryRawUnsafe('PRAGMA integrity_check');
    if (integrity.length !== 1 || Object.values(integrity[0])[0] !== 'ok') throw new Error('Database integrity check failed');
    const tables = await db.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const counts = {};
    for (const { name } of tables) {
      const rows = await db.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM "${name.replaceAll('"', '""')}"`);
      counts[name] = Number(rows[0].count);
    }
    return counts;
  } finally { await db.$disconnect(); }
}

async function snapshot(root, source, destination, plane = 'tenant') {
  if (!fs.existsSync(source)) throw new Error('Snapshot source does not exist');
  if (fs.existsSync(destination) || fs.existsSync(`${destination}.json`)) throw new Error('Snapshot destination already exists');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const db = client(root, source, plane);
  try {
    // VACUUM INTO creates a consistent SQLite snapshot, including committed WAL data.
    await db.$executeRawUnsafe(`VACUUM INTO '${path.resolve(destination).replaceAll('\\', '/').replaceAll("'", "''")}'`);
  } finally { await db.$disconnect(); }
  const counts = await inspect(root, destination, plane);
  const manifest = {
    format: 1, createdAt: new Date().toISOString(), plane,
    file: path.basename(destination),
    sha256: createHash('sha256').update(fs.readFileSync(destination)).digest('hex'),
    counts,
  };
  fs.writeFileSync(`${destination}.json`, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return manifest;
}

function migrate(root, file, plane = 'tenant', executable = process.execPath) {
  const schema = path.join(root, 'packages', plane === 'provider' ? 'admin-database' : 'database', 'prisma/schema.prisma');
  const urlName = plane === 'provider' ? 'ADMIN_DATABASE_URL' : 'DATABASE_URL';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return new Promise((resolve, reject) => {
    const child = spawn(executable, [path.join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--schema', schema], {
      cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', [urlName]: databaseUrl(file) },
    });
    // Consume output without forwarding schema URLs, environment or database details.
    child.stdout.resume(); child.stderr.resume();
    const timer = setTimeout(() => { child.kill(); reject(new Error('Database migration timed out; previous database is retained')); }, 120_000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`Database migration failed (exit ${code}); previous database is retained`)); });
  });
}

module.exports = { databaseUrl, inspect, snapshot, migrate };
if (require.main === module) {
  const [command, plane, source, destination] = process.argv.slice(2);
  const root = path.resolve(__dirname, '../..');
  const run = async () => {
    if (!['tenant', 'provider'].includes(plane)) throw new Error('Plane must be tenant or provider');
    if (command === 'snapshot' && source && destination) await snapshot(root, source, destination, plane);
    else if (command === 'migrate' && source && !destination) { await migrate(root, source, plane); await inspect(root, source, plane); }
    else throw new Error('Use snapshot <plane> <source> <new destination> or migrate <plane> <database>');
  };
  run().catch(error => { console.error(error.message); process.exitCode = 1; });
}
