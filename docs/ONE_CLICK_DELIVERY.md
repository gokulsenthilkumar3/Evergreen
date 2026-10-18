# Installation, deployment and updates

The supported entrypoints build from active source and the lockfile. Windows customers receive a one-click installer. Hosted installations use one command, or the provider's Deploy button after a GitHub runner is configured. Signing credentials, host access and approval are installation-specific.

## Windows installation

Build on Windows with Node.js 22.12 or newer:

```sh
npm ci
npm run release:desktop
```

This compiles the API, shared packages and renderer, prepares a self-contained Node/Prisma runtime, and tests it against a disposable database before packaging. Output is `apps/desktop/dist/EverGreen-<version>-win.exe`, `SHA256SUMS` and `release-manifest.json`. The manifest records source commit, dirty-tree flag, dependency lock hash, API/schema/web hashes and bundled Node version. Local unsigned builds have updates disabled.

Double-click the per-user installer. It needs no separate Node or database installation. First launch asks for the administrator username, email and password, creates a fresh database through migrations, and generates installation secrets once. Secrets are protected with Electron's OS-backed `safeStorage`; the database, installation record and encrypted secrets live under Electron's `userData`, separately from the program.

For signed updates, configure `EVERGREEN_UPDATE_URL`, `EVERGREEN_WINDOWS_PUBLISHER` and electron-builder signing credentials. The URL must be a public HTTPS directory without credentials, query or fragment. With the supplied GitHub publication workflow, use the public repository's `releases/latest/download/` directory. Private authenticated feeds need separate implementation. The publisher must match the certificate, signing is required when updates are enabled, and the source tree must be clean and committed.

Use **Help → Check for updates**. After confirmation, the app downloads the signed release, stops its API, creates a verified snapshot and starts the installer. Next launch migrates a new database generation and retains the previous one. Uninstall preserves application data. Moving Windows accounts needs a separately verified data-and-secret migration; copying an encrypted secret file alone is insufficient.

An older populated `database.db` without its original encryption configuration is left untouched. Preserve it and recover its configuration before migration. See [desktop delivery](DESKTOP_DELIVERY.md) for runtime boundaries and remaining OS acceptance checks.

## Hosted installation

Prerequisites: Docker Engine with Compose v2, Node.js 22.12 or newer, a repository checkout, and access to images or build dependencies. Choose an installation name and retain its state directory across checkouts.

```sh
npm run deploy -- --project mill-one --release <commit-sha>
npm run deploy -- status --project mill-one
npm run update -- --project mill-one --release <next-commit-sha>
```

These commands build locally. Add `--pull` and configure `EVERGREEN_IMAGE_PREFIX` for published images, for example `ghcr.io/<owner>/<repository>`. Log Docker into the registry when required. Use immutable commit tags; do not reuse a tag for different source.

Default state is `.evergreen/deploy/mill-one`. Use `--state /absolute/persistent/path` on every command when storing it elsewhere.

| File | Purpose |
| --- | --- |
| `installation.env` | Persistent unique secrets, bootstrap credentials and host settings; created only when absent |
| `state.json` | Installed release, image prefix, Docker project and active database filenames |
| `previous-*.json` | Previous release and database selections |
| `pending.json` | Interrupted/incomplete deployment evidence; blocks another install/update |
| `operation.lock` | Exclusive lock; a crash requires inspection before recovery |

Read initial credentials from the protected `installation.env`, open `http://localhost:4000` and change the password. Keep that file private and backed up with the databases. On Windows, restrict the state directory ACL; POSIX mode bits do not establish Windows ACL isolation.

Web ports bind to loopback; API ports are not published. Configure a host TLS reverse proxy for remote access. Optional settings in `installation.env` are `EVERGREEN_PUBLIC_PORT`, `EVERGREEN_PROVIDER_PORT`, `EVERGREEN_MARKETING_PORT` and `EVERGREEN_BIND`. The parser accepts one `NAME=value` per line and optional matching outer quotes; it executes no shell expressions.

Add `--all` to include provider and marketing applications. They use separate networks and a separate provider database volume. Customer-only is the default. Docker project identity includes a hash of the state directory so two directories with the same logical name do not share volumes. Installations on one host also need distinct public ports.

The canonical [Compose recipe](../deploy/docker/compose.yml) uses the multi-target [Dockerfile](../deploy/docker/Dockerfile). Root production Compose delegates to it. The Linux compatibility script calls the same helper without installing Docker or overwriting secrets.

## Update and recovery

1. Lock the installation and build/pull new images while the old release serves.
2. Stop web traffic and APIs for a maintenance window.
3. Snapshot SQLite into new database filenames, with integrity checks, row counts, SHA-256 and manifests. Keep original files intact.
4. Migrate candidates with the release's bundled Prisma CLI and explicit schema. Require healthy APIs.
5. Record the traffic boundary, start web applications, verify health and save installed state.

A migration/API failure before traffic resumes automatically restarts previous images and databases. Failure after traffic may have resumed retains `pending.json` and both generations. Rollback then could discard new writes, so an operator must reconcile before recovery.

After interruption, inspect the lock, pending record, Docker state and both database generations. Establish that no deployment process is running before clearing a stale lock. `prepared`/`starting` means the candidate was not intentionally exposed; verify actual traffic before selecting the previous release. `publishing` means candidate writes may exist: stop traffic, preserve both copies, then complete the new deployment or reconcile those writes before switching back. Never delete a candidate or bypass pending state by repeatedly installing. Restore into a new location and compare balances using the [maintenance runbook](MAINTENANCE_RUNBOOK.md#back-up-and-restore).

Same-disk snapshots protect upgrades. Independent encrypted retention, backup monitoring and a measured recovery drill remain necessary. Provider sync and outbound email are disabled in the supplied customer runtime pending separate configuration and acceptance. `AUTO_MIGRATE=true` is rejected and the HTTP migration endpoint returns 503; migrations belong to controlled release entrypoints.

## Provider Deploy button and release creation

The provider reads published GitHub releases and persists `ReleaseJob` before dispatch. Retry keys reuse recorded jobs; changed payloads conflict, and only one active operation is allowed per target. Lost acknowledgement remains `UNKNOWN` without another dispatch. Success requires a matching completed workflow; the UI links to that evidence.

Configure these on the provider server, never in a browser bundle or customer API:

| Setting | Value |
| --- | --- |
| `EVERGREEN_GITHUB_REPOSITORY` | `owner/repository` containing the workflows |
| `EVERGREEN_GITHUB_TOKEN` | Server credential for release/action reads and workflow dispatch |
| `EVERGREEN_DEPLOY_TARGETS` | JSON mapping registered company UUIDs to approved runner/environment slugs |

A target mapping can contain `{"<company-uuid>":"mill-one"}`. Browsers cannot select arbitrary runner labels, shell commands, repositories or credentials. Existing provider access/session guards remain; replacing shared operator authentication is separate work.

For each target, create a protected GitHub environment with `EVERGREEN_DEPLOY_STATE` set to an absolute persistent path outside the checkout. Register a trusted Linux self-hosted runner with labels `evergreen-deploy` and the target slug, with Docker access. Protect environments and runners from untrusted pull requests. The workflow pulls customer images at the published release's resolved commit SHA and runs the maintenance helper.

Configure the protected `release` environment with variables `EVERGREEN_UPDATE_URL` and `EVERGREEN_WINDOWS_PUBLISHER`, secrets `WINDOWS_CSC_LINK` and `WINDOWS_CSC_KEY_PASSWORD`, and permission to publish GitHub releases and GHCR packages. Commit the next desktop package version before requesting that exact stable version. The workflow verifies main, builds all five images and the signed installer, then publishes only after both artifact jobs pass. Existing tags are rejected. A feed on different storage requires publication there to be implemented separately.

Without credentials/runners the controls report unavailable, failed or pending results rather than simulated execution. Creating a company record does not provision infrastructure. Review exact production targets and signing/publication approval before the first real release.

## Acceptance commands

```sh
npm run test:release
node scripts/release/smoke-containers.mjs --all
npm run release:desktop
```

Container acceptance creates a unique temporary installation, checks stock/invoice/payment read-back after upgrade, injects API startup failure, verifies rollback and removes only its test containers/volumes. Desktop preparation runs a similar test against the packaged runtime. These supplement repository verification and supported-Windows install, signed-update, printing and customer acceptance.
