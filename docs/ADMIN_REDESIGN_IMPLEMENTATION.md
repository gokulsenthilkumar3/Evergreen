# Admin redesign implementation

Implemented against `apps/admin-api/EverGreen Admin — Ground-Up Redesign.md` on 1 November 2026.

## Technology decision

Keep React 19, TypeScript, Vite and NestJS. The existing portal is client-side owner tooling with no SEO requirement; a Next.js server or framework migration would duplicate working authentication and deployment boundaries. The new UI uses shared CSS tokens and React components under `apps/admin-web/src/redesign`. Deterministic CSS 3D supplies the empty-state fallback without loading Three.js or running a WebGL loop. A future dense interactive estate graph may justify a lazy-loaded renderer; it is not required for today's registry topology.

## Implemented

- Three-zone responsive shell: compact navigation rail with hover/keyboard expansion, workspace stage, persistent detail/proof/raw inspector; selected inspectors become overlays on smaller screens.
- Angular visual language: chamfered surfaces, cyan/violet domain accents, subtle canvas grid, depth, shared transitions and reduced-motion support. Motion pauses for hidden/offscreen empty scenes.
- Ctrl/Cmd+K command palette searches modules, company names/IDs and records already loaded from the provider API.
- Server-derived proof badges: editable control rows remain `recorded`, regardless of a claimed status or payload evidence URL. Successful release jobs with a run ID classify as `executed`, not independently `verified`. Failed/cancelled jobs classify as failed; others remain requested.
- Proof & audit and job queue read persisted audit entries and current release-job snapshots through `GET /control/proof`. Coverage is explicitly capped at 250 audit entries plus 250 current job states. This is not a complete historical transition ledger.
- Topology renders registered companies and intended hosts with dashed relationships. It does not imply cloud provisioning or measured connectivity.
- Owner-authorized Data Explorer uses `POST /control/explorer`. Approved projections of Company, ControlRecord, ReleaseJob and ControlAudit are paged at 50 rows; private credentials and payloads are excluded. Each read writes an audit entry. No arbitrary SQL and no additional delegated-user grant model are provided.
- Setup views explain absent provisioners, operator RBAC, secret-manager integrations, backup collectors and durable SLO monitoring. They do not provide simulated actions.
- Existing owner authentication and installation guards remain in force. Existing business records and active database schema are preserved.

## Backend work still required for the full design

Independent read-back and persisted evidence provenance/expiry are required before `verified` or `stale` can be earned. A full immutable transition ledger, source identity, evidence digest/signature, and retention/pagination beyond the bounded view remain future work. Current control audits are database records, not a cryptographically tamper-evident journal.

Cloud connector tests, webhook delivery/retry/replay, customer heartbeat verification, rollback orchestration, durable telemetry percentiles/history, real cloud provisioning, individual RBAC/passkeys, secret rotation, scheduled backups and measured restore drills require their own implementations. The portal deliberately shows these boundaries. Nothing in this redesign provisions cloud resources, changes owner key custody or replaces the desktop runtime.

## Verification

Admin-web production build and 19 component/regression tests passed. Admin-api compiled and five targeted proof/storage tests passed, covering untrusted verification claims, safe projections, audited reads and invalid table/page rejection. Browser automation was unavailable, so screenshot-based visual acceptance remains pending. The live API smoke check is recorded in the implementation handoff rather than inferred from unit tests.

Live smoke check: authenticated proof returned HTTP 200; audited Company metadata read returned HTTP 201 (Nest's default POST success status), with four rows and no credential columns. An unauthenticated proof read returned 401; requesting the private ProviderAdmin table returned 400. The metadata reads generated audit entries and did not change company records.
