# Maintenance runbook

How to verify a change, keep the generated evidence current, investigate an issue and rehearse recovery. These steps are run on demand and by CI. Nothing here schedules background jobs.

## Before you start

- Use Node 22.12 or newer and npm; CI uses Node 22. On Windows, run `npm.cmd` if PowerShell blocks `npm.ps1`.
- Work from the repository root. Install with `npm ci` on a clean checkout.
- Never use a customer database as a test fixture.
- Read [architecture](ARCHITECTURE.md), the [project status](PROJECT_AUDIT.md) and the [backlog](IMPLEMENTATION_BACKLOG.md).

## Verify a change

```sh
npm run verify
```

This generates both Prisma clients and compares each migration history with its schema in a shadow database. Then it type-checks the customer API and web app, runs every workspace's unit and component tests and the customer HTTP tests, validates the agent policies and audit scripts, checks generated docs for drift, and builds every workspace that has a build script.

Run the read-only lint and dependency checks separately, as CI does:

```sh
npm run lint:check -w apps/api
npm run lint:check -w apps/admin-api
npm run lint -w apps/web
npm run lint -w apps/admin-web
npm audit --omit=dev --audit-level=high
```

The API `lint` scripts fix files in place, so use `lint:check` on them. Record each command's exit code and full output. A failed command is a failed check even if a later one passes, and an audit that cannot reach the network is not a clean result. Add the run to the validation record in [project status](PROJECT_AUDIT.md#validation-record).

`npm run verify` does not build a desktop installer or a container image. Those have their own gates (EG-03, EG-11).

## Refresh generated evidence

After changing source, regenerate the knowledge references and inventories, then confirm nothing is stale:

```sh
npm run docs:generate
npm run audit:roadmap
npm run audit:surface
npm run docs:check
npm run audit:check
npm run test:maintenance
```

| Generator | Output |
| --- | --- |
| `docs:generate` | Page wiki, UI controls, API handlers, workflows, data models, code index and coverage under `docs/wiki` and `docs/reference` |
| `audit:roadmap` | [Roadmap evidence](reference/ROADMAP_EVIDENCE.md): which planned source files exist |
| `audit:surface` | [Project surface](reference/PROJECT_SURFACE.md): every authored source and config file, with a content hash |

`docs:check` also verifies every local link in the root README, workspace READMEs and `docs/`. Review the regenerated diff. Never regenerate to hide a finding, and never hand-edit generated tables.

## Investigate an issue

1. Reproduce the operator action with synthetic data. Note the expected and actual behaviour and the stock, money or time affected.
2. Trace screen → API client → controller and guard → service → transaction → model → print or report. Check both the provider and customer sides where relevant.
3. Check the [issue register](audits/2026-10-11/issue-register.md) for an existing entry. Add a regression test that fails before the fix.
4. Fix it at the owning boundary, keeping permission, retry, correction and closed-period behaviour intact.
5. Run focused tests, then the repository checks, then regenerate references.
6. Update the register entry with evidence, or add one with the next free ID.

Always consider: duplicate clicks, network loss after commit, an ID from another company, an expired session, malformed amounts, unknown statuses, empty and very large datasets, partial returns and payments, held stock, closed periods and unavailable providers.

## Back up and restore

Never copy a live SQLite file with `cp` or `Copy-Item`, because the copy may be inconsistent. Take an online snapshot instead:

```sh
sqlite3 packages/database/prisma/dev.db ".backup 'evergreen-YYYYMMDD-HHMM.db'"
```

`VACUUM INTO 'evergreen-YYYYMMDD-HHMM.db'` also works. For each snapshot:

1. Record its SHA-256 checksum, the applied migration name and the app version.
2. Keep at least one copy off the machine, ideally encrypted.
3. Restore into a separate environment with outbound email, provider and device actions disabled.
4. Compare row counts, stock by item, lot and owner, open invoices and payments, and journal balance.
5. Have an operator walk through receipt to collection on the restored copy.
6. Record the restore time, snapshot age, any differences, the reviewer and the next drill date.

A backup file name alone is not recovery evidence. Never run `migrate dev`, `db push`, `migrate reset` or a provider-triggered migration on a customer database. The PostgreSQL move (EG-26) needs its own reconciled migration, not a datasource switch.

## Review cadence

| Cadence | What to review | Output |
| --- | --- | --- |
| Every change | Regression tests, generated-doc drift, migration consistency | CI evidence and an updated register entry |
| Weekly | Failed postings, support incidents, broken links, priority blockers | Top three issues with owners and dates |
| Monthly | Off-site restore, dependency advisories, access and key review, latency and bundle trends | Recovery evidence and backlog changes |
| Quarterly | Buyer interviews, unit economics, architecture triggers | Updated research decisions and release scope |

## Troubleshooting

- **Stale docs or inventory:** run the generators, review the diff and run the checks again.
- **Migration difference:** compare the schema and history against a shadow database, then add a reviewed forward migration. Never rewrite applied history.
- **Provider sync returns 401:** the customer sync has no scoped credential yet (EG-02). Do not copy the provider key onto a customer machine.
- **Remote action returns 503:** expected until a real execution worker exists. Nothing was queued or run.
- **Slow web tests:** imports dominate the run time. Keep the bounded worker count and profile imports before adding workers.
- **Root build passes but packaging fails:** Docker and Electron are separate artefacts (EG-03, EG-11).

## Evidence template

```text
Date / commit / OS / Node:
Issue IDs and changed behaviour:
Commands / exit codes / durations / log locations:
Dataset and isolation:
Pass and fail counts, coverage limits:
Before and after measurements:
Migration / restore / rollback evidence:
Operator or provider acceptance:
Open blockers / owner / next review:
```
