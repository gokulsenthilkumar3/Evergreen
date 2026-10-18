# Gate workflow audit — 11 October 2026

Scope: inspection of the current working tree, including existing staged work. This is a targeted product/readiness audit, not certification of the whole application. Findings below distinguish existing code from proven field operation. Companion documents: [pilot plan](../../GATE_PILOT_PLAN.md), [moisture research](../../COTTON_MOISTURE_RESEARCH.md).

## Decision

Keep EverGreen and the current NestJS/React/Prisma stack. Make cotton receiving and accountant reconciliation the first pilot workflow. Target a mill that actually buys ginned cotton bales; do not assume every textile business in Tirupur or Karur has the same receiving process. Keep the existing 2D dashboard as the default and defer further 3D investment until the pilot demonstrates value.

The practical product promise is **traceable cotton receipts and less reconciliation work**. Claims about fraud prevention, savings per truck, payback in one month, or automatic accounting are not yet supported by this implementation.

## Evidence and gaps

| Area | Evidence in repository | Finding and priority |
| --- | --- | --- |
| Inward and physical inventory | `apps/api/src/modules/inventory/inventory.service.ts`, `InwardEntry.tsx` | Existing receipt, stock transaction, batch merge, QR and production-consumption paths. Existing weighbridge sync discarded source readings and used billable weight as physical stock. P0 correction implemented in this change. |
| Moisture policy | `apps/weighbridge-agent/src/anti-tamper.ts`, former sync implementation | Silent 8.5% default and unsupported CCI/SIMA attribution. No evidence this is the pilot's contract. New receipt workflow defaults to pending settlement; a deduction-only contract rule requires an explicit baseline and contract reference. |
| Device capture | `apps/weighbridge-agent/src/index.ts`, `indicator-parsers.ts`, `thermal-printer.ts` | Parsers, signing helper and printer command generation exist. Runner uses simulated frames and a demo key. No demonstrated device installation, serial acquisition, durable delivery queue, calibration record or server device-key verification. P0 before claiming automatic capture or fraud prevention. |
| Procurement and payments | `apps/api/src/modules/workflows/workflows.service.ts` | Purchase orders, goods receipts, supplier bills/payments/allocations, journals and `LINK_COTTON_RECEIPT` already exist. Extend these instead of introducing a second accounts-payable system. Missing: validated moisture settlement linkage from this receipt to approved supplier bill and reconciliation UI. |
| Tally | `apps/api/src/modules/integrations/tally/` | XML file export existed; this is not acknowledged automatic synchronization. Purchase vouchers were inferred from inward weight with a fallback rate of 180 and fixed split tax. Public export/summary bypassed authentication. This change protects both with ADMIN and blocks inferred purchase vouchers. Sales/receipt export remains an existing, unvalidated integration path. |
| Book-Ellam | `apps/web/src/pages/BookEllam.tsx` | A visible register page exists, but inward/outward used mismatched routes and inward amounts could be invented. These paths and inward figures are corrected here. Other mappings need reconciliation against actual contracts: customer balances are not a transactional Khata, production totals are not machine logs, and an All Books tab is not a cash/day book. Six authoritative registers are not complete. |
| 2D and 3D interfaces | `Dashboard.tsx`, `CommandCenter.tsx`, `App.tsx` | Both already exist; default navigation starts at Dashboard. Improve task completion and error states first. Font/contrast/spacing claims in the proposal were not visually measured by this audit. |
| Database planes | Tenant and admin Prisma schemas, `docker-compose.production.yml` | Separate applications and SQLite databases exist. Both current schemas are SQLite, not tested dual SQLite/PostgreSQL operation. Compose connects tenant API to the admin network and publishes API ports. Isolation must be verified across secrets, networks, backups and support access before claiming a guarantee. |
| Provider telemetry | `apps/api/src/services/admin-sync.service.ts` | Uses localhost and a demo company fallback; ignores the configured admin URL and approximates invoice counts from outwards. Define and test the actual telemetry contract and authorization. P0 deployment gate. |
| API security | `app.module.ts`, `roles.guard.ts`, `main.ts`, `auth.module.ts` | Global authentication and method-based role enforcement already exist; RBAC is not frontend-only. Helmet and DTO validation exist, but `any` request bodies need explicit checks. Tokens expire after one day in the inspected config. Review session revocation, refresh design and rate limiting; an API gateway alone will not fix route exposure. |
| Operational deployment | `docker-compose.production.yml` | Demo secret fallbacks, database-volume mounting and tenant/admin connectivity need an actual deployment/restore exercise. Do not introduce Kubernetes just to appear cloud agnostic. |
| Audit evidence | Stock transaction and activity log implementations | New receipt and activity event commit together. Ordinary logs and an unverified HMAC string are not an immutable/tamper-evident history. Key custody, independent anchoring and verification remain future work. |

## Implemented first slice

1. Added a versioned receipt snapshot to `InwardBatch`, with an additive nullable migration. Historical rows remain unknown; no original readings are invented.
2. Added a manual weighbridge receipt dialog to Inward Entry. It records lot, time, supplier, bales, gross, tare and moisture content, with a live physical/billable preview and explicit pending state.
3. Centralized validation and calculation in `packages/types/weighbridge.ts`. The server independently recalculates totals and ignores claimed totals/seals. Physical stock uses gross minus tare; monetary deductions do not remove cotton from inventory.
4. Saved the receipt, cotton movement and actor audit event in the existing stock transaction. An identical stable lot retry reuses the receipt; changed details conflict. The unique batch constraint also prevents two persisted lots with one identity. Concurrent requests may require retry after database contention; this is not a durable offline queue.
5. Protected captured receipts against destructive deletion. Corrections must follow a reviewed reversal path; an in-place amendment/approval UI is not part of this slice.
6. Showed saved gross/tare/moisture, policy and billable values in receipt labels and history. Fixed the Book-Ellam inward/outward routes and removed invented inward/waste valuation fallbacks.
7. Protected Tally export/summary with ADMIN, used authenticated browser downloads, and removed the guessed purchase-voucher generator. Purchase requests now return a clear prerequisite error; default exports are Sales/Receipt only.

## Remaining release gates

- No live hardware, Tally company, supplier bill, payment or cloud deployment was exercised by this change.
- An operator-entered contract reference is traceability, not accountant approval. Implement policy approval/versioning, sampled bale measurements, premiums, rejection and dispute handling before automated settlement.
- Pending receipts capture physical stock but do not themselves create a quality hold. Pilot operating procedures must keep acceptance and production-release decisions explicit; integrate the existing quality holds next.
- Complete Book-Ellam's authoritative register mappings, loading/error coverage and reconciliation; totals spanning different kinds of records are not a financial statement.
- Finish the procurement link and source Tally purchase vouchers from approved bills, with actual tax and ledger mapping, stable external IDs and import acknowledgements.
- Test offline retries, cancellation/reversal, multiple stations, closed accounting periods and restoration from backup on a pilot installation.
- Existing staged changes and unrelated edits were preserved. No application database was migrated and no branch was committed or deployed as part of this change.

## Validation record

Validation commands and final results are recorded in the pilot plan after execution. The targeted tests cover malformed measurements, forged totals, pending policy, retry identity, conflicting lot reuse, stock-versus-settlement weight, audit errors, deletion protection, export authorization and form submission.
