# Implementation backlog

This backlog groups the open work into delivery packages (EG-xx) with acceptance criteria. Individual defects live in the [shared issue register](audits/2026-10-11/issue-register.md), and each package below lists the register IDs it closes. Add new defects to the register, not here.

Owners are roles to assign, not named people. Sizes: S is 1–2, M is 3–5 and L is 6–15 engineer-days, plus external acceptance. They are estimates, not deadlines.

**An item is done only when it is implemented, its failure paths are tested, documentation is updated, any migration has a rollback plan, and the owning business role has accepted it.** Finished code alone cannot close an acceptance gate.

## Package-to-register map

| Package | Register IDs |
| --- | --- |
| EG-01 / EG-10 remote operations | API-004, API-005, UI-003, INT-008 |
| EG-02 / EG-09 tenant-scoped sync | SEP-002, API-006, API-002, SEC-004, BIZ-005 |
| EG-03 reproducible deployments | REL-001, REL-002, REL-003, REL-008 |
| EG-04 recoverable backups | REL-005, DB-009 |
| EG-08 transaction cost | API-012, PERF-001 |
| EG-11 Windows distribution | REL-009, DB-011 |
| EG-15 end-to-end acceptance | TEST-004, TEST-008 |
| EG-16 runtime contracts and money | API-001, API-010, DB-004, BIZ-020 |
| EG-17 retries and concurrency | API-008, BIZ-004 |
| EG-18 provider identity | SEC-003, SEC-005, UI-001 |
| EG-19 Tally | INT-001, INT-002 |
| EG-20 device capture | INT-006, BIZ-008, BIZ-009, BIZ-010 |
| EG-21 external delivery | REL-007, INT-003, INT-004 |
| EG-22 licensing and usage | BIZ-006, BIZ-007 |
| EG-23 bounded lists and bundles | PERF-001, PERF-002 |
| EG-24 observability and accessibility | REL-006, UI-015 |
| EG-26 sites and PostgreSQL | DB-003, SEP-004 |
| EG-28 lint gates | TEST-005 |

## Completed work

| Date | Item | Evidence |
| --- | --- | --- |
| 2026-10-14 | EG-01 remote actions no longer fake success | Unknown actions return 400, unsupported ones 503; maintenance flag and audit row share a transaction; regression spec |
| 2026-10-14 | EG-05 source audit scripts | `roadmap-audit.mjs`, `project-audit.mjs`, `audit.test.mjs`, wired into `npm run verify` |
| 2026-10-14 | EG-04 backup guidance corrected | Online snapshot and isolated restore steps in the runbook; a real restore is still pending |
| 2026-10-14 | EG-14 license claim removed | Unsupported MIT statement removed; the owner still has to choose a license |
| 2026-10-15 | EG-09 provider request contracts | DTOs, allowlisted writes, atomic license/audit and metrics writes, no enrollment key in reads; 51 HTTP cases |
| 2026-10-15 | EG-02 license response safety | Full response validated, provider suspension wins, cleared expiry respected; 49 service tests |
| 2026-10-15 | Provider renewal UI | Duplicate-submit protection and honest sync/payment messages |
| 2026-10-15 | Repository clean-up (UI-020) | Unreachable web code, unused dependencies, archives and built bundles removed; see the [15 October report](audits/2026-10-15/REPORT.md) |

## Release sequence and dependencies

~~~mermaid
flowchart TD
  A[Recoverable data and reproducible package] --> B[Receipt-to-collection acceptance]
  B --> C[Paid single-company pilot]
  D[Tenant-scoped identity and validated contracts] --> E[Acknowledged provider operations]
  C --> F[Tally and hardware acceptance]
  E --> G[Signed licensing and exact usage]
  F --> H[Measured scale and site isolation]
  G --> H
~~~

No scheduled date overrides a failed correctness or recovery gate. Postpone multi-site sales, automated remote migrations and live statutory submissions until their own gates pass.

## Wave 1: dependable single-company pilot

### EG-04 — Recoverable backups (P0, operations owner, M)

Files: docs/MAINTENANCE_RUNBOOK.md, packages/database/scripts/migrate-evergreen-one.js, deployment entrypoints.

Implement a SQLite-consistent online snapshot into a new destination, metadata/checksum manifest, encrypted off-host retention and a restore command targeting a fresh environment. Make retention and failed backups observable. Treat a restored copy as isolated until reconciliation and operator checks pass.

Acceptance: restore a representative database; compare row counts, open invoices/payments, stock by item/lot/owner and journal balance; retain measured restore time and snapshot age. Rehearse failed migration recovery without overwriting the only surviving copy. Proposed pilot targets: at most 24 hours of lost work and recovery within 4 hours; owner must accept or tighten these before promising them.

### EG-03 — Reproducible deployments (P0 for containers, platform owner, M)

Files: deploy/docker/Dockerfile.*, deploy/docker/*entrypoint.sh, docker-compose.production.yml, deploy/linux/*.

Remove nonexistent root tsconfig copy and replace db:generate with the real generate command. Supply the complete required workspace manifests before npm ci. Build/copy every runtime workspace export; separate writable DB files from image-owned schema/migrations; verify non-root ownership and clean-volume behavior. Review published API ports, TLS, secret injection and the provider/tenant network boundary.

The VM helper currently overwrites tenant.env, omits JWT/bootstrap setup and claims RHEL support while using apt-get. Make reruns preserve configured secrets, select supported distributions explicitly, and verify service executable paths.

Acceptance: clean-cache images build in CI; fresh volume boots; upgrade preserves data; health and proxy routes work; secrets are absent from image layers; restart/restore works. Run the desktop gate separately. No container daemon or deployed host was exercised in this audit.

### EG-15 — End-to-end operational acceptance (P0 for pilot, business/QA owner, M)

Files: apps/api/test, inventory/production/commerce/billing/jobwork/workflows/quality services, tenant screens, [test scenario catalogue](TEST_PLAN.md).

Use a disposable migrated DB with a known receipt dataset. Cover receipt → consumption → output/waste/WIP → hold/release → reserved order → partial dispatch → invoice → partial payment → correction. Repeat commands after a lost response; exercise VIEWER/MODIFIER/ADMIN; fail midway through transactions; backdate across a closed period.

Acceptance: original source IDs remain traceable; stock, ownership, invoice dues and balanced journals match independent calculations; rejected requests leave no writes. Have an operator complete the same flow in the browser with reload and error recovery. Existing unit/HTTP tests are inputs to this gate, not its replacement.

### EG-16 — Runtime contracts and money/quantity boundaries (P1, API owner, M)

Files: tenant controllers, provider companies.controller.ts/service.ts, DTOs, packages/types and packages/pdf.

Replace inline/any write payloads with explicit runtime DTOs plus domain validation. Allowlist updateable fields. Reject malformed IDs, NaN/infinity, out-of-range quantities, unsupported status transitions and caller-supplied audit identity. Document rounding and precision separately for money, weight and tax.

Acceptance: adversarial HTTP cases cover every changed write route. Server-calculated totals agree with prints and ledger. A decimal-storage migration requires a reconciliation plan; do not silently convert every Float field.

### EG-17 — Retry and concurrency contract (P1, API owner, M)

Files: commerce invoice creation, integrations imports, workflow posting, inventory/production/billing mutations.

Inventory actual retry support per command. For missing high-value writes, persist scoped request key, normalized payload hash and final response in the same transaction as the command. Same key/different payload returns a conflict. Define retention and recovery after ambiguous outcomes.

Acceptance: simultaneous identical requests produce one posting; changed payload conflicts; transaction failures permit safe retry; repeated receipt/dispatch/payment never duplicates stock or cash. Do not describe all write endpoints as idempotent until this inventory passes.

## Wave 2: connected provider and integrations

### EG-02 / EG-09 — Tenant-scoped sync (P0 before connected rollout, security/API owner, M)

Files: apps/api/src/services/admin-sync.service.ts, apps/admin-api/src/guards/provider-access.guard.ts, modules/companies, both schemas.

15 October update: provider company DTOs, response minimization, bounded metrics and atomic persistence now have real HTTP regression coverage. The tenant client now validates the complete license response before writing settings, preserves explicit provider suspension regardless of expiry/grace, and clears both expiry dates when the provider removes expiry. Its 49 service regressions cover renewal, clock boundaries, invalid/partial responses and transport failures; 31 failed against the previous implementation. This closes these response-safety defects, not tenant ownership, credential rotation or exact billing-period metering.

Create a distinct tenant credential scoped to one company and sync-only operations; store a verifier rather than a broadly returned credential. Keep provider operator authentication separate. Read configured HTTPS endpoint/company identity; omit sync entirely when unconfigured. Use exact invoice counts and explicit usage periods, bounded requests, timeout/backoff and redacted logs. Retain response validation before applying settings.

Acceptance: tenant A cannot sync tenant B, list companies, change licensing or perform provider actions. Revoked keys fail. Forged counts/statuses are rejected or treated as untrusted metrics. Timeout leaves prior valid settings intact. Test clock/period boundaries and rotation. Never solve today's 401 by installing ADMIN_API_KEY on tenant machines.

### EG-01 / EG-10 — Acknowledged remote operations (P1, platform/security owner, L)

Files: companies.service.ts, control records, tenant admin-ops controller, provider UI and schema.

Current behavior rejects unimplemented actions. Future worker states: REQUESTED → APPROVED → QUEUED → RUNNING → SUCCEEDED/FAILED/EXPIRED. Bind approval to tenant, action, package digest and expiry; require tenant receipt and execution evidence before success. Use idempotent acknowledgements, bounded retries and audit actor identity. Migration execution uses a reviewed artifact, explicit schema path, backup proof and asynchronous worker.

Acceptance: disconnected tenant never appears successful; expired/replayed approvals fail; unknown actions cannot become shell commands; requester/canceller/executor are attributable. Provider maintenance preference is desired state, not evidence of enforcement. Existing historical EXECUTED rows need classification rather than automatic acceptance.

### EG-18 — Provider identity and sensitive data (P1, security owner, M)

Files: provider guard, ProviderAdmin model, companies API and provider auth client.

Replace the shared operator key with individual session/identity-provider authentication, narrow roles and expiring support grants when operational need justifies it. Minimize returned company credentials; keep any initial enrollment handoff separate and audited. Add rate limits and key/session rotation procedures.

Acceptance: read-only operator cannot mutate, revoked sessions stop working, support access expires, and audit actor comes from the authenticated principal. Company staff credentials confer no provider authority.

### EG-19 — Tally coexistence (P1 after pilot, integrations owner, M)

Files: apps/api/src/modules/integrations, tenant Integrations page, Tally export tests.

Keep supported Sales/Receipt export distinct from acknowledged import. Pin customer Tally version, map masters/tax/units, persist external voucher identities and import results, and reconcile duplicates/errors. Purchase posting remains unavailable until mapping is accepted.

Acceptance: import into a test Tally company; compare voucher counts, balances and taxes; replay creates no duplicates; rejected masters remain actionable. See official-source version research before choosing XML versus JSON.

### EG-20 — Device capture and trustworthy receipts (P1, hardware/API owner, L)

Files: apps/weighbridge-agent, inventory receipt DTOs/services, shared receipt contracts.

Implement serial device adapters, stable-frame selection, disconnect/reconnect, enrollment, per-device secret storage/rotation and server verification with sequence/nonce replay control. Keep gross/tare/net separate from contract-specific settlement weight; record calibration/reference and operator overrides.

Acceptance: actual indicator/moisture meter/printer, unstable/error frames, unplug/replug, power loss, replay and tampered payloads. A successful local HMAC test proves integrity under a key, not calibration or absence of fraud.

### EG-21 — Durable external delivery (P2, integrations owner, L)

Implement transactional outbox, authenticated inbox, stable event IDs, retries/backoff, dead-letter review and reconciliation. Start with one customer-required connector. Keep providers outside stock transactions. Add e-Way Bill/payment connectors only with approved provider contracts and sandbox credentials.

Acceptance: timeouts, duplicate/out-of-order callbacks and partial provider failures cannot duplicate business postings. External submission is complete only after stored provider acknowledgement. A generated PDF/XML or HTTP 200 alone is insufficient.

### EG-22 — Licensing and measured usage (P2, provider/product owner, L)

Define server-issued signed entitlement, key rotation, validity/grace, read/export access after expiry and per-period posted-document usage. Configuration and permissions remain separate. Current SystemSettings fields and sync code do not establish a trusted licensing system.

Acceptance: tampering, clock rollback, replay and wrong-company licenses fail; invoice/order retry does not double-charge usage; plan changes preserve customer records; commercial agreement governs charges. Depends on EG-02 and a validated commercial offer.

## Wave 3: measured performance and growth

### EG-08 — Transaction cost (P1 scale gate, data owner, M)

Measure stockTransaction with 1k/10k/100k movements and 1/5/10 concurrent operators; record query count, lock failures, CPU, memory and p50/p95/p99. Reconciliation currently runs repeatedly over broad histories and has queries inside loops.

Implement scoped/incremental projection only after a golden full-reconciliation comparison exists. Preserve immutable journal postings, held/reserved stock and closed periods. Add indexes based on query plans, not by indexing every field.

Acceptance: exact same balances and journal contents for normal/correction/backdated datasets; rollback remains atomic; no increase in contention errors. Proposed pilot budget: p95 ordinary posting below 2 seconds on the agreed host; this is a target, not a measured result.

### EG-23 — Bounded lists, reports and frontend cost (P1, full-stack owner, M)

Files: dashboard, inventory, commerce and provider list services; large page components; web build output.

Add stable pagination/cursors and bounded date ranges to high-volume reads without silently truncating totals. Profile real routes; defer print/export/3D/avatar imports until needed. Keep numerical cards independent of animation. Establish bundle/route-load baselines and reduce expensive test imports before adding workers.

Acceptance: first/last pages and filtered totals agree, no duplicated/missing rows during pagination, cancelled requests stop work, old cached data is labeled, keyboard/reduced-motion paths work. Record before/after measurements and hardware. Do not invent a performance improvement percentage.

### EG-11 — Supported Windows distribution (P1 for desktop sales, desktop owner, L)

Build the backend from canonical source for every release; record commit and artifact digest. Bootstrap an empty migrated database instead of shipping operational data. Verify writable user-data path, runtime dependencies, port configuration, upgrade and recovery. Define offline scope; bidirectional cloud sync is a separate conflict-resolution project.

Acceptance: clean Windows install, update from previous supported version, user-data preservation, recovery and signed installer provenance. Root npm run build does not run electron-builder.

### EG-24 — Observability, support and accessibility (P1, operations/web owner, M)

Add request correlation, transaction latency/lock counters, backup freshness, connector backlog and actionable alerts without credentials or unnecessary personal data. Establish incident ownership and a small support-ticket workflow.

Acceptance: a failed receipt/import produces a user-visible explanation and a traceable server event; stale widgets identify freshness; forms retain drafts; keyboard/screen reader and narrow-display checks pass. Physical TV readability and browser layout require actual acceptance.

### EG-25 — Complete secondary workflows (P2, product/API owner, M per module)

Audit warehouse transfers, machine inspections, QC holds, shifts/HR/payroll, scheduled email, public shop and reporting with each domain owner. Record valid states, actor, money/quantity impact, cancellation and reporting expectations per module. Do not present operational payroll records as certified statutory payroll.

Acceptance: module-specific no-mock scenarios and operator sign-off; unavailable email/providers never show delivery success; public shop authorization/stock rules remain independent of staff UI. Prioritize by observed pilot usage.

### EG-26 — Sites and PostgreSQL (P2, data/platform owner, L)

The owner chose one PostgreSQL database per customer on 2026-10-12. Only test data exists, so the migration history may be rebuilt as a clean baseline with exact money types (DB-004). One person owns the schema rebuild at a time. Separately, introduce stable site IDs, a default-site migration and balanced inter-site transfers across stock, production, QC and costing. Preserve IDs, chronology, precision, ownership, journals and backups across the conversion.

Acceptance: cross-site authorization/stock tests, reconciled before/after totals, rollback/rehearsal evidence and sustained load. Business-mode navigation and named warehouse locations do not provide site isolation.

### EG-27 — Commercial readiness and discovery (P1, business owner, S plus pilot)

Use the [research plan](LONG_TERM_RESEARCH.md) to validate buyer pain, support effort and willingness to pay. Resolve source ownership/license and contract scope. Align marketing and demo behavior with accepted capabilities.

Acceptance: written pilot scope, measurable baseline, paid willingness-to-pay evidence, contribution economics including founder time, honest feature matrix and renewal decision. No customer communications or pricing publication were performed in this audit.

### EG-28 — Restore required lint gates (P1, engineering owner)

Non-modifying lint checks currently fail for tenant API/web and provider API. Separate formatting debt, unsafe types and React lifecycle warnings; fix owning modules without weakening rules. Preserve unrelated working-tree changes. The changed company API DTO/controller/service/HTTP suite has a separate focused check.

Acceptance: every CI lint command exits zero on the same revision as passing tests/builds, with no broad suppression or generated-file noise. See the [validation record](PROJECT_AUDIT.md#validation-record) for dated totals; a green test suite alone cannot close this item.

## Longer-term direction

These outcomes guide the roadmap to 2030. None of them exists until its evidence does.

| Priority | Outcome | Evidence required |
| --- | --- | --- |
| 1 | One stock ledger across mill and commerce | End-to-end reconciliation, rollback and duplicate-request tests |
| 2 | Recoverable operations | Online backup, restore drill and migration rollback |
| 3 | Complete API contracts and access control | DTOs, role tests and documented responses on every write route |
| 4 | Accessible workflows on every device | Keyboard, screen-reader and narrow-screen checks with usable error recovery |
| 5 | Useful automation | Approval rules, audit history, idempotency and exception handling |
| 6 | Connected telemetry and forecasting | Real device and provider feeds, source timestamps and measured forecast error |
| 7 | Offline desktop that never drops entries | Durable local queue, background sync and conflict rules (owner decision, 2026-10-12) |

Automation should build on reconciled records, and any forecast or live status must show its source and freshness.

## Reusable implementation record

For every new task, record:

| Field | Required content |
| --- | --- |
| ID / owner / state | Stable ID; responsible role; proposed/in-progress/implemented/accepted |
| Trigger and impact | Reproducible operator action; stock/cash/time affected |
| Source evidence | Paths, failing command or observed behavior |
| Design | Boundary, DTOs/events, invariants, failure semantics |
| Dependencies | Other task IDs and external access |
| Data changes | Migration, reconciliation, backup and rollback |
| Acceptance | Happy path, negative/permission/retry/concurrent paths |
| Measurement | Baseline, target, environment, before/after |
| Delivery evidence | Commit, commands, results, reviewer/operator and date |
| Rollout | Feature flag/configuration, canary, rollback trigger and owner |

No issue closes because an implementation file was created. Use the [maintenance runbook](MAINTENANCE_RUNBOOK.md) to keep this register current.
