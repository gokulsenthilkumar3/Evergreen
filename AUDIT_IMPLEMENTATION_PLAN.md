# EverGreen audit implementation plan

Repository: https://github.com/gokulsenthilkumar3/Evergreen

Working directory: `D:\Projects\EverGreen`. Changes are local; they have not been pushed or deployed.

## 1. Repair the current build and security regressions

Implemented: merge conflict resolution, shared PDF test/runtime exports, JWT rotation and placeholder rejection, Helmet, MFA result handling, DTOs for new operational modules/login, controller/schema alignment, live operational displays/QC, honest helpdesk/e-Way Bill behavior, production trend chart and CI.

Verification commands:

```powershell
npm run generate -w @evergreen/database
npm test -w apps/api -- --runInBand --no-coverage
npm test -w apps/web
npm run build -w apps/api
npm run build -w apps/web
```

Current unit suite: 46 API tests across 10 suites and 13 web smoke tests. The new tests reject invalid MFA results, unknown machine fields, negative warehouse quantities, invalid shift times, unsupported QC status and the original JWT placeholder. These are unit/validation checks; they do not replace database integration or browser tests.

## 2. Complete input validation across legacy APIs

Implement by domain in this order: users/settings/auth, inventory/production, billing/commerce/storefront, costing, jobwork. Derive each request contract from both the service's consumed fields and its frontend callers. Use DTO classes with nested validation, explicit numeric/date ranges and supported enum values; distinguish create/update DTOs and omission from null. Derive audit identities from the authenticated request rather than accepting client-supplied identities. Add typed service inputs and response projections without exposing secrets.

Acceptance: malformed bodies and extra fields return 400 before database calls; authorized valid requests retain behavior; viewers cannot mutate and tenants/users cannot access each other's records. Inventory and money operations must remain transactional and preserve stock/payment invariants. Do not claim whitelist coverage for an endpoint until its DTO and HTTP test exist.

## 3. Resolve dependency and lint debt

Use the recorded audit to split runtime exposure from build/test tooling. Upgrade Vitest and its coverage package together in an isolated change; update test config and confirm coverage. Upgrade Electron with installer, preload and packaged-app checks. Replace or update spreadsheet handling after choosing a maintained dependency and testing export compatibility. Investigate the remaining compatible transitive fixes separately. Never run a blanket forced upgrade.

Use the lint JSON files to fix formatting, dead imports and small typing issues by module, followed by unsafe assignments/member access and hook issues. Keep normal lint rules; avoid globally disabling rules to get a green check.

Acceptance: clean dependency installation, unchanged invoice/export behavior, passing unit/build checks, no unreviewed critical audit findings, and lint errors reduced to zero. Then make lint/audit blocking CI gates. Branch protection should require the CI validate job; configure it in GitHub after the workflow has executed successfully.

## 4. Finish operational workflows

- Warehouse: location/movement forms, server-derived stock totals, explicit quantity units, transfer source/destination semantics, insufficient-stock handling and transaction tests. Do not sum a truncated recent-movement list as a balance.
- Machines: registry and maintenance forms using `serialNo`, `manufacturer`, `active`, `date`, `status` and `resolvedAt`; decide whether capacity/spindles/next-due dates belong in a schema migration.
- QC: validated inspection forms, filtering/pagination and defined units/limits for measurements; do not substitute CSP/TPI data for unrelated schema fields.
- HR: staff/shift/payroll forms, attendance inputs, rounding rules, payroll month uniqueness, and controlled salary access. Reject inconsistent net pay and derive totals on the server.

Acceptance: create/read/update flows use real persisted data, display server errors, refresh affected queries and have no fake success states. Exercise roles through real HTTP routes and a test database.

## 5. Add durable helpdesk and provider-backed e-Way Bills

Helpdesk: ticket model/migration, authenticated creation, ownership checks, administration/status history, delivery integration and tests. Replace local draft submission only once a server-generated persisted ID is returned.

e-Way Bills: choose the actual provider and configure credentials in a secret store. Add backend issuance/status/cancellation adapters, idempotency, retries, audit records and sandbox tests. Persist only provider-issued numbers as official records; preserve legacy local records as unverified.

Acceptance: provider or backend failures are visible, repeated requests cannot duplicate issuance, and no success is displayed before confirmation. This phase depends on real provider/account configuration.

## 6. Migrate and establish production acceptance

Prepare a PostgreSQL-specific Prisma migration history and an isolated target database. Back up SQLite, copy data in dependency order, reconcile row counts, foreign keys, stock balances, invoice totals and session/auth behavior, and rehearse cutover/rollback. Keep the production source until reconciliation and acceptance complete.

Turn `PARITY_REGISTER.md` into explicit pass/fail gates. Add Playwright tests for login/MFA, roles, inventory, production, billing/payments and the new operational flows. Run against a disposable database. Measure load performance and split heavy avatar/export chunks as needed. Configure deployment only after these gates pass and verify health after deployment.

Acceptance: reconciled migration, passing parity/browser gates, required GitHub checks, documented backup/restore, and a monitored deployment. These are separate deliverables; they are not inferred from passing unit tests.
