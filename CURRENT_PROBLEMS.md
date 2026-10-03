# EverGreen current problems

Checked against the repository on 2026-10-03. This replaces the duplicated audit's assumptions with verified findings. See [implementation plan](AUDIT_IMPLEMENTATION_PLAN.md).

## Fixed in this working tree

- Resolved merge markers in the PDF package, invoice calculations and API Jest configuration. Kept the corrected invoice discount calculations.
- API Jest compiles shared TypeScript as CommonJS. Production API builds the PDF package before Nest; Node can load its compiled CommonJS export.
- Rotated the local placeholder JWT secret using cryptographic randomness. Its value is never printed. `.env` is ignored and is not tracked. Restart the API and sign in again after rotation. Production secrets must be rotated in the actual deployment's secret store separately.
- JWT startup validation rejects known placeholder patterns even when they exceed the minimum length.
- Fixed an MFA bypass missed by the original report: both login and MFA activation now check `otplib`'s verification result's `valid` property. Invalid-result regression tests cover both paths.
- Installed `helmet` and replaced manual security headers with its middleware.
- Added validated DTOs for login and the warehouse, machine, QC and HR mutations; enabled global whitelist and unknown-field rejection for DTO-backed routes.
- Aligned machine and QC POST contracts with their Prisma models; added machine-scoped inspection routes and integer query parsing.
- Corrected HR, payroll, machine and warehouse pages to display actual API fields. Payroll no longer calls methods on nonexistent gross-pay values; warehouse cards no longer invent capacity or treat five recent movements as stock balances.
- Connected QC to the real inspections API with loading, error, empty and refresh states.
- Added a production chart using live history and the existing Recharts dependency.
- Helpdesk saves explicitly local drafts using UUIDs and no longer promises submission or a support response.
- e-Way Bill issuance is disabled; synchronization/cancellation report that the provider is unavailable. Existing browser records are explicitly unverified.
- Geolocation is disabled unless an HTTPS provider URL is configured; requests have a three-second timeout.
- CI installs dependencies, generates Prisma, builds shared PDF code, checks types, tests and builds API/web. It reports lint and dependency audit results.
- Documented daily email and optional geolocation configuration.
- Applied compatible dependency updates without forcing major upgrades.

## Still open

| Priority | Problem | Evidence and next step |
| --- | --- | --- |
| High | Legacy mutation bodies remain unvalidated | Billing, commerce/storefront, inventory, production, costing, jobwork, settings, users and some auth flows still use `any` or inline objects. Global whitelist does not validate those types. Add endpoint-specific DTOs, including nested arrays, and negative HTTP tests. The original report establishes a validation/mass-assignment risk, not proof of SQL injection. |
| High | Dependency vulnerabilities remain | Explicit `npm audit --json` reports **27 findings: 2 critical, 15 high, 10 moderate** after compatible updates. See `audit-dependencies.json`. Vitest/coverage require a major migration; Electron also requires a major update; npm reports no fix for `xlsx`. Re-run audit before making upgrade decisions. |
| High | CI lint and audit are informational | Baseline scans found 1,490 API lint errors and 411 web lint errors. Details are in `audit-api-lint.json` and `audit-web-lint.json`; line positions are from the initial scan and may shift after repairs. Reduce this backlog and then remove `continue-on-error`. |
| Medium | Operational pages do not provide complete CRUD workflows | The four domains have read/create APIs and live read pages. Add validated forms, edit flows, pagination and tested permissions. Warehouse needs an explicit stock/transfer contract; machine schema has no spindle/capacity fields. |
| Medium | Helpdesk is local-only | A browser draft is not a durable server ticket. Add ticket persistence, ownership, admin triage and delivery before enabling submission. |
| Medium | e-Way Bill provider is absent | Real issuance, sync and cancellation require provider credentials and a backend adapter. Preserve local records as unverified; never turn a local ID into an official number. |
| Medium | SQLite to PostgreSQL migration is not complete | Docker infrastructure alone does not migrate a SQLite Prisma schema or data. Prepare a separate migration and reconcile copied inventory, financial and relational data before cutover. |
| Medium | Parity acceptance and browser e2e remain incomplete | Evaluate `PARITY_REGISTER.md` and add Playwright coverage of real authenticated workflows using an isolated test database. Current tests do not establish full browser or production parity. |
| Medium | Other demonstration pages remain | SupplierPortal and other yarn pages still contain demo datasets outside the three pages identified by the original report. Inventory all routes and label or replace them before production acceptance. |
| Low | Large frontend bundles | Vite reports chunks over 500 kB, including avatar/export dependencies. Profile route load times and split those dependencies where useful. |

GitHub branch protection, remote workflow execution, deployment configuration, production secret rotation and live provider behavior have not been verified. No production database migration or deployment was performed.
