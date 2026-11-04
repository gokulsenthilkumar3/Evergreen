const { PrismaClient, Prisma } = require('@prisma/client');

/** Preserve the existing API number/date contract while PostgreSQL stores exact decimals. */
function decodeDecimals(value) {
  if (Prisma.Decimal.isDecimal(value)) {
    const number = value.toNumber();
    if (!Number.isFinite(number) || !new Prisma.Decimal(number).equals(value)) {
      throw new Error('Stored decimal exceeds the supported API numeric precision');
    }
    return number;
  }
  if (value === null || typeof value !== 'object' || value instanceof Date || Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return value.map(decodeDecimals);
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, decodeDecimals(child)]));
}

function createDatabaseClient(options = {}) {
  const url = options.datasources?.db?.url || process.env.DATABASE_URL || '';
  if (!/^postgres(?:ql)?:\/\//.test(url)) return new PrismaClient(options);
  let PostgresClient;
  try { PostgresClient = require('./generated/postgres').PrismaClient; }
  catch { throw new Error('PostgreSQL client is missing. Run npm run generate -w @evergreen/database'); }
  const client = new PostgresClient({ ...options, datasources: { db: { url } } });
  client.$use(async (params, next) => decodeDecimals(await next(params)));
  return client;
}
module.exports = { createDatabaseClient, decodeDecimals };
