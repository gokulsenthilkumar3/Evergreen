# EverGreen — SQLite Backup & Migration Manifest

## Phase 0 & Phase 5 — Safety Gate

## Backup Strategy

Before any schema change or data migration, a full backup of `dev.db` MUST be taken.

### Backup Location

Backups are stored in `EverGreen/backups/` with the naming convention:

```text
dev_<YYYY-MM-DD_HH-MM-SS>.db
```

### How to Create a Backup (PowerShell)

```powershell
$timestamp = (Get-Date).ToString('yyyy-MM-dd_HH-mm-ss')
Copy-Item packages/database/prisma/dev.db "backups/dev_$timestamp.db"
Write-Host "Backup saved: backups/dev_$timestamp.db"
```

### How to Create a Backup (bash/cmd)

```bash
cp packages/database/prisma/dev.db backups/dev_$(date +%Y-%m-%d_%H-%M-%S).db
```

---

## Backup Log

| Date       | Filename                    | Trigger                                             | Verified By |
| ---------- | --------------------------- | --------------------------------------------------- | ----------- |
| 2026-10-03 | dev_2026-10-03_pre-merge.db | Phase 0 initial snapshot before super-project merge | pending     |

---

## Phase 5 — PostgreSQL Migration Plan

### Step 1: Update Prisma datasource

In `packages/database/prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Set DATABASE_URL for PostgreSQL

In `packages/database/prisma/.env`:

```env
DATABASE_URL="postgresql://evergreen:evergreen_password@localhost:5432/evergreen_db"
```

### Step 3: Start PostgreSQL

```bash
docker-compose up -d postgres
```

### Step 4: Run migrations against PostgreSQL

```bash
npx prisma migrate deploy -w @evergreen/database
```

### Step 5: Reconcile data

Run a data reconciliation script (TBD) to import SQLite historical records into PostgreSQL, verifying:

- All `CottonInventory` quantities match
- All `YarnInventory` quantities match
- All `Production` records match
- All `Invoice` totals match
- All `Customer` ledger balances match

### Step 6: Verify and cut over

Set `EVERGREEN_PUBLIC_PORT=4000` and `EVERGREEN_API_PORT=4301` in production `.env`.

---

## Hard Gates (from PARITY_REGISTER.md)

1. Back up SQLite and reconcile every legacy quantity and currency balance with unified ledgers.
2. Eliminate remaining active duplicate stock/production/costing writes.
3. Complete every reference function row with owner, API/data source, working status, automated test and live QA evidence.
4. Test the full loop, cancellation/reversal, every role, Tamil/English, mobile, print/PDF and `/shop` checkout on port 4000.
5. Stage and verify PostgreSQL separately; one production origin/port is not yet proven.
6. Obtain acceptance, archive all five source folders and separately located data snapshots.

**Status as of 2026-10-03**: SQLite is still canonical. PostgreSQL infrastructure is provisioned in `docker-compose.yml` and is ready for Step 3 onward. No cutover has occurred yet.
