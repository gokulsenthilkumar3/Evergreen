const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createDatabaseClient } = require('./runtime-client');

// A PostgreSQL server must have its migrations applied explicitly before the API
// starts. Startup verifies their checksums; it never migrates a live database.
async function checkPostgres() {
  const client = createDatabaseClient();
  try {
    const rows = await client.$queryRawUnsafe('SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"');
    const directory = path.join(__dirname, 'prisma/postgres/migrations');
    for (const name of fs.readdirSync(directory)) {
      const file = path.join(directory, name, 'migration.sql');
      if (!fs.existsSync(file)) continue;
      const checksum = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (!rows.some(row => row.migration_name === name && row.checksum === checksum && row.finished_at && !row.rolled_back_at)) {
        throw new Error('PostgreSQL schema is not at the reviewed migration version');
      }
    }
    if (rows.some(row => !row.finished_at && !row.rolled_back_at)) throw new Error('An unfinished PostgreSQL migration requires recovery');
  } finally { await client.$disconnect(); }
}
module.exports = { checkPostgres };
if (require.main === module) checkPostgres().catch(() => {
  console.error('PostgreSQL schema verification failed. Apply and verify approved migrations before startup.');
  process.exitCode = 1;
});
