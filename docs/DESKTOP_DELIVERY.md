# Desktop development and delivery

Reviewed against the canonical release builder and launcher on 2026-10-19. See [installation, deployment and updates](ONE_CLICK_DELIVERY.md) for commands, signing/feed setup and recovery.

## Runtime and data ownership

`apps/desktop/main.js` loads `launcher.cjs`. The release builder compiles the API, shared packages and renderer from active source. It materializes the locked dependency graph, generated Prisma client/engine, schema and migrations, and a separate bundled Node executable. Legacy `backend/` and `web-dist/` copies are excluded from the artifact.

Electron's sandboxed renderer loads a loopback HTTP server serving web assets and proxying `/api/backend` to the private API. Both ports are dynamic. Host validation and traversal checks protect the server; the renderer has no Node integration and restricts navigation and external URL schemes. Setup exposes only the validated first-run action.

First launch asks for administrator credentials, generates installation secrets once and stores them with OS-backed `safeStorage`. Databases are created through migrations without development records. Installation state identifies the active database generation and runtime/schema hashes. Upgrade snapshots the previous generation into a candidate, migrates it, waits for API health and commits the new selection. Previous files remain intact on failure.

The Help menu checks the configured signed HTTPS feed. After confirmation it stops the API and takes a verified snapshot before replacement. Unsigned local builds have updates disabled. Uninstall preserves `userData`; restore must preserve the database and recoverable secrets. A populated legacy `database.db` without its original encryption configuration remains untouched and requires explicit migration.

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

The explicit flag loads `http://localhost:4000` and skips the packaged API. See [Quick Start](../QUICK_START.md) for development configuration.

## Build and packaging contract

`npm run dist:desktop` and `npm run release:desktop` invoke the same builder. It compiles the runtime and tests a fresh temporary database with login, stock, invoice, partial payment, consistent snapshot, candidate migration and business read-back before packaging.

Runtime/updater tests cover setup validation, persistent secrets, loopback/proxy boundaries, signing configuration and failure handling. These do not replace supported-Windows or customer acceptance.

The one-click per-user NSIS target creates `EverGreen-<version>-win.exe`, a runtime manifest and SHA-256 checksums under `apps/desktop/dist`:

```sh
npm run release:desktop
```

Signed updates require a clean committed tree, matching publisher and signing certificate, and a public HTTPS feed. Packaging does not publish artifacts. OS installer, signed-update and customer acceptance remain in EG-11 in the [backlog](IMPLEMENTATION_BACKLOG.md).

## Customer acceptance

1. Record the source revision, package version, checksum and supported Windows versions.
2. Test a clean installation with synthetic data: writable paths, configuration, API startup failures, port conflicts, dependencies and renderer connectivity.
3. Provision unique bootstrap administrator credentials. Do not ship populated development databases or historical example passwords.
4. Exercise receipt, production, dispatch, invoice, payment, reports and printing; restart and reconcile persisted quantities and balances.
5. Rehearse signed update, failure recovery and restoration into a separate location. Disable outbound provider, email and device actions. Confirm standard-user permissions and uninstall/reinstall preserve customer records.
6. Deliver operating instructions, support contact, backup schedule and a demonstrated restore procedure with the accepted artifact.

Use a consistent SQLite snapshot with checksum and schema/version metadata, retain an independent copy, and verify restoration. An ordinary copy of a live database is not guaranteed consistent. Follow [back up and restore](MAINTENANCE_RUNBOOK.md#back-up-and-restore) in the maintenance runbook.

Never delete customer data to resolve a login problem. Diagnose configuration, credentials, startup logs and schema state while preserving the database. Hardware support, hosted synchronization and cloud backup need separate acceptance evidence.
