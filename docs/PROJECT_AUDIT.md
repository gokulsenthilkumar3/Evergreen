# Project status

Assessed on 2026-10-14 and updated on 2026-10-30. This is the current engineering view of EverGreen. Work packages are in the [backlog](IMPLEMENTATION_BACKLOG.md), individual defects are in the [shared issue register](audits/2026-10-11/issue-register.md), and the latest review is the [30 October running-application report](audits/2026-10-30/REPORT.md). The [15 October report](audits/2026-10-15/REPORT.md) remains the latest code and architecture review.

## Summary

EverGreen has a substantial operational core: receipts, production, stock and lots, sales orders, invoices, payments, job work, and a separate provider workspace. Delivery now includes source-built Windows installers and controlled container upgrades with synthetic recovery evidence. Connected provider authentication, production signing and host acceptance, representative off-site recovery and business/device acceptance remain release gates.

On 30 October the application was run for the first time in a browser review: every staff screen at desktop and phone width, plus the business flow and adversarial inputs against the live API on a disposable database. That found and fixed an unusable phone layout, offline failures in the sign-in and dashboard scenes, unchecked catalogue and customer input, caller-controlled GST rate and seller state, an incorrect Tally export, overdue alerts that could never fire, and the desktop test that had failed every recent hosted CI run on `main`.

The review covered every workspace, both database histories, scripts, CI, deployment recipes and documentation, and inspected the highest-risk paths directly. It did not include browser or device acceptance, live integrations, load tests, cloud deployment, restoring customer data, or legal and commercial approval.

## How to read status

- **Verified**: a named check ran and passed, for the scope it states.
- **Implemented, acceptance pending**: the code exists, but production behaviour is unproven.
- **Confirmed defect**: a reproducible check or a direct contradiction in the code shows a failure.
- **Proposed**: a design or contract with no delivery claim.
- **External acceptance**: needs a real operator, deployment, provider or device.

A file, a passing unit suite or a generated document never moves a feature straight to "accepted in production".

## Findings

| ID | Priority | Finding | Status |
| --- | --- | --- | --- |
| EG-01 | P1 | Provider recorded every remote action as executed, including unsupported ones | Fixed: unknown actions return 400 and unsupported ones 503; the maintenance flag and its record share a transaction |
| EG-02 | P0 before connected rollout | Customer sync still has no tenant-scoped credential or billing-period usage contract | Response handling fixed on 15 October; opt-in transport, timeout, overlap protection and actual lifetime invoice counts fixed on 17 October; authentication and period metering remain open |
| EG-03 | P0 before containers | Old container recipes referenced missing files/scripts | Replaced by canonical multi-target builds; all five services pass local install/update/failed-update acceptance; production host acceptance remains |
| EG-04 | P0 before customer use | Backups were plain copies of a live SQLite file | Consistent snapshot, integrity/count/hash manifests and synthetic restore/read-back verified; encrypted off-site retention and representative measured recovery remain |
| EG-05 | P1 | The roadmap audit used stale paths and mixed source checks with completion claims | Fixed, with regression tests |
| EG-07 | P1 | Architecture and commercial docs overstated what was delivered | Corrected; consolidated again on 15 October |
| EG-08 | P1 scale gate | `stockTransaction` repeats full reconciliation inside a 60-second transaction, with queries in loops | Confirmed concern, not a measured incident; benchmark before refactoring |
| EG-09 | P1 | Provider company handlers took untyped bodies, leaked fields into updates and returned enrollment keys | Fixed on 15 October with DTOs, atomic writes and 51 HTTP tests |
| EG-10 | P1 | Request-time migration and simulated deployment outcomes | HTTP/boot migration paths disabled; durable provider jobs, protected workflows and controlled candidate migration implemented; real target configuration/acceptance remains |
| EG-11 | P1 | Desktop used stale runtime copies and a template database | Canonical builder, migrated first run, OS-protected secrets, signed updater and runtime upgrade/read-back implemented; supported-Windows/signed-release acceptance remains |
| EG-12 | P1 | The weighbridge entry point is a simulation with fixed input and key | Open (INT-006) |
| EG-13 | P1 | Marketing and several shared packages lack acceptance coverage | Desktop runtime/updater regression and actual runtime checks now exist; other gaps remain |
| EG-14 | P1 | License statements conflict between README and package metadata | MIT claim removed; the owner still has to choose a license |
| EG-28 | P1 CI gate | Non-modifying lint fails for the customer API, customer web and provider API | Open (TEST-005): 1,496, 428 and 211 errors on 30 October |

P0 means a blocker for that rollout, not an active production incident.

## Business-flow readiness

| Flow | What exists | Acceptance still needed |
| --- | --- | --- |
| Company and staff onboarding | Per-installation settings, bootstrap admin, sessions, JWT and role guards; seller state must match the company GSTIN; a password change signs out other sessions | Fresh install, expiry and revocation, last-admin protection, company identity on prints |
| Cotton receipt and weighbridge | Receipt snapshots, contract-specific moisture handling, parser library | Gross/tare/net consistency, pending settlement, duplicate saves, calibrated equipment |
| Production and costing | Consumption, output, waste, WIP, costing and ledger projection | Mass balance, backdating, partial WIP, posted-cost corrections, period locks |
| Stock control | Catalogue movements, lots, holds and warehouse movements | Ownership, negative stock, reservations, quarantine, transfers, concurrent dispatch |
| Order to invoice | Order and fulfilment links, invoice snapshots, shared PDF totals; GST rate from the catalogue and tax state from GSTINs; partial invoice from an order verified through the API on 30 October | Partial fulfilment, server retry keys on orders, rounding, void handling, compliant document numbers |
| Collection | Invoice-linked payments, customer ledger, journal projection; partial and full payment, replay and rejection cases verified through the API on 30 October | Reversals in the accounts, settlement totals, closed periods, bank evidence |
| Job work | Dispatch and return lines with loss tracking | Multiple partial returns, outstanding material, fee reconciliation |
| Operations and recovery | Health and status endpoints, migration checks, separate provider DB | Restore from an off-site snapshot, upgrade rehearsal, alert ownership |
| Integrations | CSV master import, Tally sales/receipt export (void and internal rows excluded, ledgers by rate since 30 October), provider registry | Tally ledger mapping and acknowledgement, tenant isolation, exact usage accounting |

## Validation record

Every run is listed with its environment. A failed or unrun check stays visible, and no completion percentage is given.

### 2026-10-30: running-application review

Linux container, Node 22.22.0, branch `claude/trusting-archimedes-wnea6j` based on `6388b96`. Details and the defect list are in the [30 October report](audits/2026-10-30/REPORT.md).

The sandbox network policy blocks `cdn.sheetjs.com`, the source of the pinned `xlsx` tarball, so `npm ci` could not complete. Dependencies were installed with the npm-registry `xlsx@0.18.5` for this run only, and the lockfile and `apps/web/package.json` were restored unchanged. Excel export therefore ran on a different `xlsx` version here; no Excel output was inspected.

Before any change, both migration/schema comparisons, the root type-check and every unit suite passed: provider API 94, provider web 11, customer API 300, customer web 205 and the weighbridge library.

The application was started with `npm run dev` against a newly migrated SQLite file in a scratch directory, with a generated JWT secret and a one-time bootstrap administrator. Scripts then exercised the live API, and Playwright with the pre-installed Chromium opened all 35 staff routes at 1440 × 900 and 390 × 844. The first phone crawl found all 34 in-app routes overflowing. The final crawl, run after restarting on the finished code, recorded 72 page visits with no page errors, no failed API calls and no horizontal overflow. One React warning remains on Operations Command when its 3D canvas unmounts. The Tally export was checked on live data after voiding an invoice and reversing a receipt: both were left out, no amount began with `--`, and all 14 vouchers balanced.

| Final check | Result |
| --- | --- |
| Both migration/schema comparisons | No differences |
| `npm run typecheck` | Passed |
| Unit suites | 705 passed: provider API 94, provider web 11, customer API 353, customer web 219, weighbridge library 28 |
| Customer HTTP suite | 22 passed in 2 suites |
| `npm run agent:check` | Passed; 8 planner tests |
| `npm run test:maintenance` | 6 passed |
| `npm run test:release` | 23 passed. Before the desktop fix, one test failed on Linux because a backslash path was refused only on Windows. GitHub Actions shows the same failure (`runtime.test.cjs:40`) on the last five `main` runs, including `6388b96`, so hosted CI had not passed its verify step |
| Generated references and audits | `docs:check` current with 3,472 local links; `audit:check` current; maintenance 6 passed |
| `npm run build` | Every workspace built; Vite still warns about chunks over 500 kB (PERF-002) |
| Read-only lint | Still failing (TEST-005): customer API 1,496 errors (1,580 before), provider API 211, customer web 428 (431 before). Files changed here add no errors |

Not done: no operator, accountant or physical device took part; no screen reader, physical phone or low-end PC was used; production, dispatch and PDF download were not exercised end to end; no deployment, container build, desktop installer, restore or external integration was run.

### 2026-10-19: delivery implementation and branch reconciliation

Implemented [installation, deployment and updates](ONE_CLICK_DELIVERY.md): canonical Windows runtime preparation and NSIS packaging, first-run credentials, persistent OS-protected secrets, verified SQLite snapshot generations, controlled hosted maintenance updates, and durable provider jobs backed by protected GitHub workflows. Unsupported request-time migration now returns 503; boot auto-migration is rejected. Registry credentials and company-to-runner mapping stay on the provider server. Unknown dispatch acknowledgement is retained without duplicate execution.

On Windows with Node 24.12.0 and Docker Desktop's Linux engine, all five canonical images built and booted with fresh volumes. Real Compose acceptance saved synthetic stock, an invoice and a partial payment, upgraded to another release, compared business read-back, then injected an API startup failure and verified automatic recovery of the previous release and data. Only uniquely named temporary databases/volumes were used and removed. A reused HTTP test socket initially reset after container replacement; the test now closes each connection across deployment phases. This was a fixture transport failure, not evidence of data loss.

The prepared Windows runtime passed clean migration, login, stock/invoice/payment, online snapshot, candidate migration and read-back checks. NSIS packaging produced a local unsigned installer; release signing, public feed publication, supported-Windows GUI installation/uninstall and a signed end-to-end update remain external acceptance. The updater dependency was patched and the obsolete Electron runtime replaced. Neither GitHub workflow dispatch nor customer production deployment was performed.

All 43 local/fetched non-main branch refs were ancestors of local main, including Claude branches. Ancestry alone missed two semantic integration problems: provider-sync code had reintroduced an unsafe demo URL and inconsistent merged logic, and a provider filter imported the customer Prisma client, failing a clean container build. The sync implementation was restored and all 77 sync regressions passed; the provider filter now uses its own client and its clean build passes. The final remote synchronization and repository checks are recorded with the delivery evidence below.

| Final local check | Result |
| --- | --- |
| Both migration/schema comparisons | No differences |
| Customer API/web type-check, plus full provider API type-check | Passed |
| Application, HTTP, agent, maintenance and release tests | 697 passed: provider API 94, provider web 11, customer API 300, customer web 205, device library 28, HTTP 22, agent 8, maintenance 6, release 23 |
| Changed customer/provider API lint | Zero errors |
| Generated documentation and source audits | Current; 3,436 local links checked |
| Every workspace build | Completed |
| Clean locked installation and production dependency audit | Installed successfully; zero production advisories |
| Canonical Docker images | All five built and passed clean-install, populated update and failed-update rollback acceptance |
| Windows runtime and NSIS package | Actual runtime business read-back passed; package inspection passed with explicit native exit 0; all recorded checksums match |

The root verification chain ran through its final workspace build with every test/check stage passing. Windows PowerShell reported shell exit 1 because redirected native stderr creates `NativeCommandError` records; a harmless fixture reproduced exit 1 despite native exit 0, while explicitly forwarding the native status returned 0. This is a shell reporting issue, not a skipped verification stage. Installer packaging records the native exit explicitly. The local unsigned installer SHA-256 is `5cb2c564db5e07c0bf83749c65d9ed8cc35287a20775b51025ad2e96aa6d7eb0`; its manifest marks the test build as dirty and updates disabled. Production artifacts must be rebuilt from the final clean committed tree with signing configured.

The workflow now rejects installation state inside its disposable checkout, with a regression proving rejection before Docker. Existing release versions are rejected before image publication, and the tested Node/nginx bases are pinned by digest. Production credentials, protected environments/runners, signed feed publication, supported-Windows GUI acceptance and independent off-site recovery remain unexecuted.

### 2026-10-18: documentation and architecture review

Windows, Node 24.12.0, based on `5397aab`. Reviewed the customer/provider module wiring, guards, database clients, transaction and reconciliation ownership, sync transport, Electron launcher and container recipes. The 14 workspace manifests declare no local dependency cycles; this is not a source-import cycle check or deployment-isolation proof. The [architecture decision](decisions/0001-installation-and-data-boundaries.md) records existing boundaries, migration exceptions, rollout gates and rollback requirements.

Corrected the obsolete HTML-health instructions, public probe fields, issue-register maintenance guidance, conflicting PostgreSQL planning text and agent topology context. The maintained Integrations guide now matches the implemented import screen and labels connectors and scoped keys as pending. Two stale section links were found by an additional heading-link scan and corrected. The final scan passed 3,911 local file links and 33 heading links across all 118 Markdown files returned by the repository file inventory, including agent documentation; external URLs were not revalidated.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed for the customer API, its test contracts and the web app |
| Customer API unit suite | 293 passed in 21 suites |
| Provider API suite | 81 passed in 6 suites, including temporary-database HTTP contracts |
| Customer HTTP suite | 22 passed in 2 suites against temporary migrated databases |
| `npm run agent:check` | Structure/links passed; 8 planner tests passed; model-behavior scenarios remain unexecuted |
| `npm run test:maintenance` | 6 passed |
| Generated references and audit inventories | Current; 38 page entries, 139 customer API handlers and 30 workflow actions |

The changes are documentation-only. No operational database was migrated, no artifact was deployed and no production feature was accepted. The full root verify pipeline, builds, repository lint, dependency audit, browser/device checks, restore drills and two-installation isolation were not rerun. EG-02 provider authentication, EG-03 containers, EG-04 recovery, EG-10 migration orchestration, EG-11 desktop delivery and EG-26 storage/site work remain open.

### 2026-10-17: API test contracts included in type-checking (TEST-006 partial)

Windows, Node 24.12.0, based on `680fad0` plus the sync changes below. Reproduced the six test-file TypeScript errors found during the sync work, then fixed the missing commerce-controller dependency, removed the circular import mock type and directed shared-calculator compatibility cases to their supported API. The full customer API suite passed all 293 tests in 21 suites; after tightening mock types and lint cleanup, the 47 affected tests passed again.

`npm run typecheck -w apps/api` now checks application source, unit tests and HTTP fixtures. Root `npm run typecheck` calls it, so the existing CI `npm run verify` gate also checks test contracts. The expanded root type-check and ESLint for all three edited test files pass with no diagnostics. The earlier six-error result below is resolved. This does not close the broader integration/device coverage gap in TEST-006 or the repository-wide lint work in TEST-005. The full root verify pipeline and hosted CI were not run for this change.

### 2026-10-17: opt-in provider sync transport (API-006, BIZ-007 partial)

Windows, Node 24.12.0, based on `680fad0`. The new transport suite reproduced 27 failures against the previous implementation; all 77 sync cases pass after the fix (28 transport, 49 licensing). These tests use mocked HTTP and Prisma and make no external sends or operational database writes. The full customer API suite passes 293 tests in 21 suites, `npm run typecheck` passes for the customer API and web app, and changed-file ESLint passes with no diagnostics. The customer API build passes, including Prisma generation and the types/PDF package builds. Generated documentation and audit checks pass (3,394 local links), along with all six maintenance tests. The full root `npm run verify` pipeline was not run.

At this stage, the broader `tsc --noEmit -p apps/api/tsconfig.json` check failed on six existing errors in unchanged test files: `connected-modules.smoke.spec.ts`, `invoice-totals-extended.spec.ts` and `integrations.service.spec.ts`. The root type-check then used `apps/api/tsconfig.build.json` and excluded tests. The follow-up entry above records the fixes and expanded gate.

The change needs no migration. It disables unconfigured sync, validates endpoint/company settings, blocks redirects and overlapping runs within one process, times out the HTTP exchange after 10 seconds, and reads actual invoice counts. Tenant authentication, billing periods, payload-size limits, durable retries and live provider acceptance remain open. Docker/VM examples were updated but were not deployed or executed.

### 2026-10-15: repository clean-up and documentation consolidation

Windows, Node 24.12.0, branch `GokulSenthilkumar/202610152245_Cleanup`. `npm run verify` passed in 783 seconds with 619 tests: provider API 81, provider web 7, customer API 265, customer web 205, weighbridge 25, customer HTTP 22, agent planner 8, audit scripts 6. Details are in the [15 October report](audits/2026-10-15/REPORT.md#verification). Lint was not run.

### 2026-10-15: customer license sync response (EG-02)

Windows, Node 24.12.0, based on `0c6b128`. CI targets Node 22, so this does not replace CI.

- Before the change, the new service suite had 31 failures and 18 passes, including reactivated suspensions, stale expiry and writes from invalid responses.
- After the change, `src/services/admin-sync.service.spec.ts` passed all 49 tests (fixed clock, mocked fetch and Prisma, no network).
- ESLint passed with no diagnostics for `admin-sync.service.ts`, `admin-sync-response.dto.ts` and its spec.

No migration is needed. Tenant-scoped credentials, a configured HTTPS endpoint, timeout and backoff, exact usage accounting and live provider acceptance remain open.

### 2026-10-14: baseline verification

Windows, Node 24.12.0. `npm run verify` exited 1 after 674 seconds because generated docs were stale, so it never reached the build stage.

| Check | Result |
| --- | --- |
| Customer and provider migration/schema comparison | Both passed |
| Root typecheck | Passed (customer API and web only) |
| Customer API unit tests | 216 passed in 19 suites |
| Provider API unit tests (before the EG-09 fix) | 19 passed in 4 suites |
| Customer web tests | 205 passed in 25 files, about 443 seconds |
| Provider web tests | 5 passed |
| Weighbridge library | 25 passed |
| Customer HTTP tests | 22 passed in 2 suites against temporary migrated databases |
| Audit script tests | 4 passed |

### Test ownership

| Area | Tests |
| --- | --- |
| Company preferences | `settings.service.spec.ts`, `test/company-profile.test.ts` |
| CSV normalisation | `test/migration.test.ts` |
| Import persistence | `integrations.service.spec.ts` |
| Navigation | `test/navigation.test.ts` |
| Command Center animation | `CampusScene.test.tsx`, `useFullscreen.test.tsx`, `CommandCenter.test.tsx` |
| Invoices, auth, roles, inventory wizards | API and web workspace suites |
| Generated documentation | `npm run docs:check` |

Unit tests cover the implemented contracts and known regressions. They do not prove every legacy branch, and documentation coverage is not code coverage.

### Still needs acceptance

- Real browser and device checks of file pickers, fullscreen, screen readers and TV readability. Headless Chromium at 1440 and 390 px, the WebGL fallback and reduced-motion rules were checked on 30 October; physical phones, tablets and low-end PCs were not.
- A full customer restore rehearsal, with large and messy source data and historical balances.
- Multi-site accounting, provider provisioning, signed entitlements, billing and support access.
- Scoped integration credentials, durable webhooks, offline desktop sync and connector monitoring.
- Tally and e-Way Bill credentials, sandbox tests, acknowledgement reconciliation and customer-approved print samples.
- Load and soak tests, and performance evidence.

## Architecture judgement

Keep the modular monolith and one company per installation. Keep provider and company identities separate. Keep business rules at the domain command boundary, and treat stock and financial projections as owned accounting state, not a cache.

The main optimisation candidates are repeated reconciliation inside write transactions, unbounded list and history reads, heavy frontend imports and route payloads. Measure query counts, latency, memory and bundle size first, and never remove a ledger check to win a benchmark.

## Which document wins

1. This page and the issue register: dated findings and executed evidence.
2. The backlog: open work and acceptance criteria.
3. Architecture: current boundaries and intended changes.
4. Generated references: what the source contains.
5. Dated reports under `docs/audits/`: historical context only. The shared issue register is actively maintained despite its dated directory; use its latest dated resolution evidence.

## Working notes

- On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.
- The API `lint` scripts rewrite files. Use `lint:check` for a read-only check.
- Regenerate docs after changing UI controls, routes or handlers.
- The root build does not include desktop packaging.
- Retired reference projects and old SQLite snapshots now live outside the repository. See the [15 October report](audits/2026-10-15/REPORT.md#archive).
