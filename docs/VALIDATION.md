# Validation and remaining delivery gates

This file records verification for the 2026-10-10 company configuration, migration, player and documentation changes. Final command results are recorded below after execution. No live customer database, external provider or production deployment is a test fixture.

## Test ownership

| Area | Evidence |
| --- | --- |
| Company preferences | `settings.service.spec.ts`, `test/company-profile.test.ts`: valid activity/mode persistence, invalid payloads, preserved full navigation, essential pages always reachable |
| CSV normalization | `test/migration.test.ts`: arbitrary headers, quoted text/BOM/CRLF, duplicate columns, malformed rows, field mapping, numeric validation and batch limits |
| Import persistence | `integrations.service.spec.ts`: preview without writes, actor/source attribution, replay, changed-key conflict, existing-party conflict and no transaction for invalid rows |
| Navigation | `test/navigation.test.ts`: canonical legacy aliases, retained unknown-route behavior |
| Animation | `CampusScene.test.tsx`, `useFullscreen.test.tsx`, `CommandCenter.test.tsx`: pause/resume, manual selection, reduced motion, hidden-tab behavior, timer cleanup, fullscreen failure/event state, no fictitious shipment default |
| Existing business/security tests | API and web workspace suites retain invoice totals, auth/session/role rules, mutation guards, connected modules, production timing, inventory wizards and UI error behavior |
| Documentation | `docs:check`: regenerate references and fail if checked-in docs differ from source |

Unit tests cover the implemented contracts and regressions; they do not prove every legacy service branch is covered. Generated documentation coverage is separate from line/branch test coverage.

## Commands

```sh
npm run generate -w @evergreen/database
npm run migrate:check -w @evergreen/database
npm run typecheck
npm run test -w api -- --runInBand
npm run test -w web -- --maxWorkers=2 --minWorkers=1
npm run docs:generate
npm run docs:check
npm run build
```

Restricting web test workers avoids excessive concurrent transformation of the 3D dependencies on a development PC. The tests themselves remain unchanged by worker count.

## Still requires acceptance

- Real browser/device check of responsive settings/import forms, file selection, fullscreen, WebGL fallback, reduced motion and TV readability.
- Full customer restore rehearsal; large/ambiguous source datasets, historical financial balances and batch rollback against production-like data.
- Site-scoped multi-mill/warehouse accounting and operations.
- Provider control plane, tenant provisioning, signed entitlements, billing/metering and support grants.
- Scoped integration credentials, durable webhook delivery/inbox/outbox, offline desktop sync and connector observability.
- TallyPrime/e-Way Bill credentials, sandbox contract tests, acknowledgement reconciliation and customer-approved print samples.
- Load/soak testing, high-volume database conversion and performance/SLA evidence.

These are pending features or acceptance gates, not hidden behind a claim that the complete product is finished.
