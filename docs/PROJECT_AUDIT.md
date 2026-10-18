# Project status

Assessed on 2026-10-14 and updated on 2026-10-18. This is the current engineering view of EverGreen. Work packages are in the [backlog](IMPLEMENTATION_BACKLOG.md), individual defects are in the [shared issue register](audits/2026-10-11/issue-register.md), and the latest full review is the [15 October report](audits/2026-10-15/REPORT.md).

## Summary

EverGreen has a substantial operational core: receipts, production, stock and lots, sales orders, invoices, payments, job work, and a separate provider workspace, with automated regression tests across them. It is not yet a verified, recoverable commercial service. The next priorities are a reliable receipt-to-collection flow, recoverable deployment and honest provider status, ahead of new features.

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
| EG-03 | P0 before containers | Dockerfiles copy a missing root `tsconfig.json` and call a missing `db:generate` script | Open (REL-001) |
| EG-04 | P0 before customer use | Backups were plain copies of a live SQLite file, and no restore had been demonstrated | Guidance corrected; online snapshot tooling, off-site copies and a measured restore still open |
| EG-05 | P1 | The roadmap audit used stale paths and mixed source checks with completion claims | Fixed, with regression tests |
| EG-07 | P1 | Architecture and commercial docs overstated what was delivered | Corrected; consolidated again on 15 October |
| EG-08 | P1 scale gate | `stockTransaction` repeats full reconciliation inside a 60-second transaction, with queries in loops | Confirmed concern, not a measured incident; benchmark before refactoring |
| EG-09 | P1 | Provider company handlers took untyped bodies, leaked fields into updates and returned enrollment keys | Fixed on 15 October with DTOs, atomic writes and 51 HTTP tests |
| EG-10 | P1 | The customer migration endpoint runs `npx` synchronously with no approval, backup proof or acknowledgement | Open; keep remote execution unavailable |
| EG-11 | P1 | Desktop ships a packaged backend and a template database outside the root build | Open; see [desktop delivery](DESKTOP_DELIVERY.md) |
| EG-12 | P1 | The weighbridge entry point is a simulation with fixed input and key | Open (INT-006) |
| EG-13 | P1 | Marketing, desktop and several shared packages have no test script | Open; add tests where the risk is real |
| EG-14 | P1 | License statements conflict between README and package metadata | MIT claim removed; the owner still has to choose a license |
| EG-28 | P1 CI gate | Non-modifying lint fails for the customer API, customer web and provider API | Open (TEST-005) |

P0 means a blocker for that rollout, not an active production incident.

## Business-flow readiness

| Flow | What exists | Acceptance still needed |
| --- | --- | --- |
| Company and staff onboarding | Per-installation settings, bootstrap admin, sessions, JWT and role guards | Fresh install, expiry and revocation, last-admin protection, company identity on prints |
| Cotton receipt and weighbridge | Receipt snapshots, contract-specific moisture handling, parser library | Gross/tare/net consistency, pending settlement, duplicate saves, calibrated equipment |
| Production and costing | Consumption, output, waste, WIP, costing and ledger projection | Mass balance, backdating, partial WIP, posted-cost corrections, period locks |
| Stock control | Catalogue movements, lots, holds and warehouse movements | Ownership, negative stock, reservations, quarantine, transfers, concurrent dispatch |
| Order to invoice | Order and fulfilment links, invoice snapshots, shared PDF totals | Partial fulfilment and invoicing, duplicate requests, rounding, void handling |
| Collection | Invoice-linked payments, customer ledger, journal projection | Partial payments, reversals, settlement totals, closed periods, bank evidence |
| Job work | Dispatch and return lines with loss tracking | Multiple partial returns, outstanding material, fee reconciliation |
| Operations and recovery | Health and status endpoints, migration checks, separate provider DB | Restore from an off-site snapshot, upgrade rehearsal, alert ownership |
| Integrations | CSV master import, Tally sales/receipt export, provider registry | Acknowledged delivery, tenant isolation, exact usage accounting |

## Validation record

Every run is listed with its environment. A failed or unrun check stays visible, and no completion percentage is given.

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

- Real browser and device checks of responsive forms, file pickers, fullscreen, WebGL fallback, reduced motion and TV readability.
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
