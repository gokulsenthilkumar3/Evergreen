# Desktop development and delivery

Reviewed against `apps/desktop/main.js` and `apps/desktop/package.json` on 2026-10-15. This guide consolidates the root build, desktop and customer-distribution guides. Packaging exists; a current customer-ready artifact has not been established by this review.

## Runtime and data ownership

Electron creates the window, loads `preload.js` with context isolation, and starts the packaged API outside development mode. The renderer loads `web-dist/index.html`; the API comes from the packaged `backend` directory. These copies can differ from active source.

The launcher requests port 3001 and passes a SQLite URL under Electron's `userData` directory (`database.db`). API configuration and renderer routing must agree with that port. On first start it attempts to copy `backend/prisma/dev.db`. That copy is not a migration: a release must use an empty, reviewed schema and unique credentials.

The local database is independent of any hosted installation. Bidirectional desktop/cloud synchronization is not implemented.

## Development

Start the customer web/API from the repository root:

```sh
npm run dev
```

Then use a second PowerShell terminal:

```powershell
$env:ELECTRON_IS_DEV = 'true'
npm.cmd run desktop
```

The explicit flag loads `http://localhost:4000` and skips spawning the packaged backend. Without it, the launcher attempts packaged resources. See [Quick Start](../QUICK_START.md) for environment and bootstrap configuration.

## Build and packaging contract

`npm run dist:desktop` invokes `electron-builder`. It packages `main.js`, `preload.js`, `assets/`, `web-dist/` and `backend/` extra resources. It does **not** compile or refresh these copies. The old root `build-desktop.js` is absent.

Prepare and reconcile the API, renderer, shared runtime packages, Prisma client/engine, migrations and configuration from the same reviewed revision before packaging. Check renderer API routing and relative asset paths. Do not remove `web-dist/` or `backend/` as generic build clutter while packaging depends on them.

The configured Windows target is NSIS; the artifact pattern is `EverGreen-<version>-win.exe` under `apps/desktop/dist`. Once the prepared artifact contract is satisfied, run:

```sh
npm run dist:desktop
```

A successful web build or an existing `win-unpacked` directory does not establish a supported installer. Reproducible artifact preparation remains EG-11 in the [backlog](IMPLEMENTATION_BACKLOG.md).

## Customer acceptance

1. Record the source revision, package version, checksum and supported Windows versions.
2. Test a clean installation with synthetic data: writable paths, configuration, API startup failures, port conflicts, dependencies and renderer connectivity.
3. Provision unique bootstrap administrator credentials. Do not ship populated development databases or historical example passwords.
4. Exercise receipt, production, dispatch, invoice, payment, reports and printing; restart and reconcile persisted quantities and balances.
5. Rehearse upgrade and restoration into a separate location. Disable outbound provider, email and device actions during restore tests. Confirm upgrade and uninstall behavior preserves customer records.
6. Deliver operating instructions, support contact, backup schedule and a demonstrated restore procedure with the accepted artifact.

Use a consistent SQLite snapshot with checksum and schema/version metadata, retain an independent copy, and verify restoration. An ordinary copy of a live database is not guaranteed consistent. Follow [back up and restore](MAINTENANCE_RUNBOOK.md#back-up-and-restore) in the maintenance runbook.

Never delete customer data to resolve a login problem. Diagnose configuration, credentials, startup logs and schema state while preserving the database. Hardware support, hosted synchronization and cloud backup need separate acceptance evidence.
