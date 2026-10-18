# ADR 0001: Installation and data ownership

Date: 2026-10-18. Status: records the existing architecture and the PostgreSQL target already recorded in EG-26; implementation and rollout gates remain open. This review does not authorize deployment or a database conversion.

## Context

EverGreen has 14 npm workspaces. The customer API connects receipts, production, stock, invoices and payments through local database transactions. The provider API owns company registration, license configuration and usage snapshots in a separate database. Desktop packages a customer API and an independent local database.

Evidence: [customer modules](../../apps/api/src/app.module.ts), [posting boundary](../../apps/api/src/services/prisma.service.ts), [provider modules](../../apps/admin-api/src/app.module.ts), [provider client](../../apps/admin-api/src/services/prisma.service.ts), [desktop launcher](../../apps/desktop/main.js) and [EG-26](../IMPLEMENTATION_BACKLOG.md#eg-26--sites-and-postgresql-p2-dataplatform-owner-l). See the [architecture diagrams](../ARCHITECTURE.md) for runtime and posting flow.

## Decision

Retain the modular customer monolith and separate provider application. Keep customer business transactions inside the owning API and its database. Retain one installation and database per customer. PostgreSQL per customer with exact money types is the target already recorded in the backlog; both current Prisma schemas and migration histories still use SQLite.

| Boundary | Owner and rule | Current acceptance limit |
| --- | --- | --- |
| Customer identity | Staff JWT, session and role guards in the customer API | Two deployed installations still need isolation tests |
| Stock and accounting | Domain commands, `stockTransaction`, stock bridge and business ledger | Legacy payloads, retry coverage and reconciliation cost remain open |
| Provider identity | Provider API and its own database/client | Shared operator key; per-operator identity and customer-scoped sync credentials remain open |
| Provider communication | Explicit HTTP protocol with company binding | Current opt-in sync sends no credential and cannot complete against the protected provider |
| Web | UI state, navigation and API calls; shared calculation helpers may be reused | UI preferences and hidden buttons confer no API permissions |
| Shared packages | Types, calculation/layout helpers, database definitions and configuration | No dependency from a shared package into application internals |
| Desktop | Packaged customer API, renderer and local database from one revision | Packaging reproducibility, recovery and upgrades need acceptance; no cloud sync |
| Sites | Future stable site ownership and balanced transfers within a customer | Warehouse names and business modes are not site authorization |

Do not split stock, invoicing and finance into services without a measured requirement and a design preserving atomicity, retries and reconciliation. Do not add shared-table tenancy or bidirectional desktop sync as an incidental implementation detail.

## Consequences

Local transactions keep stock and financial effects together. Separate customer databases keep customer selection outside operational query filters, but create an operational obligation to provision unique databases, volumes, credentials, backups and restore destinations. Provider registration alone does none of this.

Reconciliation currently runs repeatedly inside a transaction with a 60-second timeout. Retain correctness checks and measure their cost before changing projections. A PostgreSQL conversion does not by itself remove repeated queries or resolve duplicate commands.

The existing request-time migration endpoint and optional boot migration are exceptions to deployment ownership. They need the EG-10 controlled worker design before remote execution is accepted. Container recipes and desktop copies are not proof that the reviewed source can be delivered reproducibly.

## Rollout gates

1. Close EG-03 and EG-11 for the selected delivery format: build the web, API, shared runtime packages, Prisma engine and schema from the same revision; prove clean installation and upgrade.
2. Close EG-04 with an isolated restore and reconciliation of stock, invoices, payments and journals. Record recovery time and snapshot age.
3. Prove SEP-004 with two independent customer installations, including API access, jobs, storage, secrets, backups and restore destinations. The current HTTP suites exercise temporary databases, not two deployed tenants.
4. Before connected provider rollout, complete EG-02 scoped credentials, wrong-company rejection, exact usage periods and acknowledged outcomes. Never distribute the provider operator key to customers.
5. Before database conversion, complete EG-26 and DB-004 with exact money rules, a migration plan, before/after reconciliation and concurrent posting evidence. Before site support, prove site authorization and balanced transfers separately.

## Rollback and recovery

For application-only changes, retain the previous artifact and verify schema compatibility before rollback. Preserve the database and unique installation configuration. For schema or storage changes, rehearse recovery from a consistent pre-change snapshot into a new isolated environment; reconcile it before switching traffic. Account for any writes accepted after the snapshot before cutover. Never point an older binary at an incompatible schema or overwrite the only surviving database.

Keep desktop and hosted data ownership explicit. Moving an installation is a migration with a cutover; copying files is not bidirectional synchronization.

## Verification and review triggers

The 18 October review traced module wiring, guards, clients, posting/reconciliation, sync and deployment entrypoints. All 14 workspace manifests were inspected for local dependencies; their declared dependency graph has no cycles. This does not prove that source imports are acyclic or that production isolation works. Executed checks and remaining limits belong in the [validation record](../PROJECT_AUDIT.md#validation-record).

Revisit this decision when measured write contention or recovery objectives require a topology change, when a customer requires concurrent offline editing, or when accepted site/provider requirements cannot fit these boundaries. Record the replacement decision and migration consequences before changing ownership.
