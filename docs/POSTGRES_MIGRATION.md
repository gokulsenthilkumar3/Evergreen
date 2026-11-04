# Customer PostgreSQL migration

The customer API selects SQLite or PostgreSQL from `DATABASE_URL`. Each customer keeps a separate installation and database. The provider database remains separate SQLite, and the packaged local desktop runtime retains SQLite. This tooling is not approval to cut over a live installation.

## Schema and numeric contract

`packages/database/prisma/schema.prisma` remains the SQLite schema. `npm run generate -w @evergreen/database` generates both clients and derives `prisma/postgres/schema.prisma`. `npm run postgres:check -w @evergreen/database` detects drift. PostgreSQL migrations live under `prisma/postgres/migrations`; changes require a reviewed migration as well as schema regeneration.

PostgreSQL uses `Decimal(24, 2)` for the monetary fields enumerated in `scripts/data/postgres-schema.mjs`, including invoice totals, payments and journal debits/credits. Other former Float fields use `Decimal(24, 6)` for quantities and rates. Review this field map before converting historical data. The runtime returns numbers and dates to preserve the existing API contract and rejects decimals that cannot round-trip through that numeric contract. JavaScript arithmetic still has its existing precision limits.

## Rehearse on disposable data

1. Generate both clients. Prepare an empty, customer-specific PostgreSQL database and set `DATABASE_URL` to its connection string without logging credentials.
2. Apply the reviewed target schema with `npm run migrate:postgres -w @evergreen/database`. The copy command does not create the schema.
3. Stop source writes and take a verified SQLite backup. Use a consistent database file with no outstanding WAL. The copy command opens only a temporary copy and checks SQLite integrity; the original is never opened through Prisma.
4. Set `POSTGRES_MIGRATION_URL` to the prepared destination. Run `node scripts/data/migrate-postgres.mjs --source ABSOLUTE_SQLITE_FILE --report .evergreen/migration-plan.json`. The default is a dry run. Review counts, rounded-value counts and normalized decimal totals for every table, and reconcile stock, invoices, payments and journal balance separately.
5. After approval for the exact source snapshot and destination, execute the same command with `--execute --source-stopped` and a separate report path. It refuses a populated destination, copies within one transaction, checks table counts and decimal totals, and restores autoincrement sequences. A failure rolls back copied rows. PostgreSQL sequences can advance despite rollback; a retry into the still-empty target resets them.
6. Exercise the customer API against the destination, compare business reports, and perform a PostgreSQL backup/restore drill before exposing traffic. Preserve the original SQLite backup and its checksum. Once new writes start, rollback requires reconciling those writes; pointing back to the old database would lose them.

`npm run test:data` exercises a disposable SQLite posting fixture and numeric conversion checks. Set `EVERGREEN_PG_TEST_URL` to an **empty disposable PostgreSQL database** to include the copy/restore/service test. That test applies migrations and writes fixtures. CI provisions its own PostgreSQL service; never point this variable at an operational database.

## Startup and updates

For container hosting set `EVERGREEN_TENANT_DATABASE_URL` to the approved PostgreSQL URL. The API entrypoint verifies applied migration checksums through `packages/database/check-postgres.js`; it never applies PostgreSQL migrations at startup. Other hosts must run that verification before starting the API. The SQLite release updater rejects PostgreSQL updates, including inherited connection configuration. PostgreSQL updates need a separately reviewed schema rollout, verified `pg_dump` backup, maintenance plan and recovery acceptance.

The fixture proves selected conversion and posting behavior. It does not certify every business workflow on PostgreSQL, a production-size migration, concurrency under load, or an operational recovery objective.
