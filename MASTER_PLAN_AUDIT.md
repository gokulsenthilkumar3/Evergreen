# EverGreen master-plan audit

Generated from the current checkout by `npm run audit:roadmap`.

> This report records repository evidence, not manual QA or production acceptance. A present page is not considered parity.

## Executive status

| Phase | Status | Evidence passed |
| --- | --- | --- |
| Phase 0 — Foundation & Safety | **PARTIAL** | 2/5 |
| Phase 1 — Core Business Logic | **PARTIAL** | 4/5 |
| Phase 2 — Users, RBAC & Sessions | **PARTIAL** | 5/5 |
| Phase 3 — Reference Absorption | **PARTIAL** | 4/6 |
| Phase 4 — Advanced Auth & Notifications | **PARTIAL** | 3/4 |
| Phase 5 — Database & Production Hardening | **NOT READY** | 1/4 |
| Phase 6 — Archive & Cleanup | **BLOCKED BY GATES** | 2/5 |

## Detailed gates

### Phase 0 — Foundation & Safety

**Status: PARTIAL**

- ✅ API Jest infrastructure and smoke/security tests
- ✅ Auth, catalogue, invoice and session smoke tests
- ❌ Web Vitest component-test infrastructure
- ❌ Tracked SQLite backup/snapshot manifest
- ❌ Reference projects retained

**Gate assessment:** Builds pass in CI and connected modules have automated smoke tests; an external backup manifest and approved snapshot tag still need evidence.

### Phase 1 — Core Business Logic

**Status: PARTIAL**

- ✅ Canonical yarn counts declared
- ✅ remainingLog persisted
- ✅ Costing rate settings persisted
- ✅ Today's dashboard exists
- ❌ End-to-end no-mock inward → dashboard evidence

**Gate assessment:** The complete live-data walkthrough and reconciliation evidence remain outstanding.

### Phase 2 — Users, RBAC & Sessions

**Status: PARTIAL**

- ✅ Canonical VIEWER/MODIFIER/ADMIN role hierarchy
- ✅ Admin user management UI/API
- ✅ Session persistence and revocation
- ✅ Session IP and user-agent capture
- ✅ IP geolocation integration

**Gate assessment:** Role tests exist; location enrichment and full browser role-matrix evidence are still pending.

### Phase 3 — Reference Absorption

**Status: PARTIAL**

- ✅ Invoice totals centralized and duplicate designer hidden
- ✅ Tamil/English toggle and customer ledger UI
- ✅ Public Weave shop and checkout API
- ✅ Noolstitch job-work canonical module
- ❌ Persisted warehouse, machine, QC and HR models
- ❌ All five parity gates accepted

**Gate assessment:** Action-level acceptance is incomplete, and missing reference directories must be restored or formally accounted for before parity can be evaluated.

### Phase 4 — Advanced Auth & Notifications

**Status: PARTIAL**

- ✅ TOTP backend and settings UI
- ✅ WebAuthn backend and browser dependencies
- ✅ Daily-summary template
- ❌ Scheduled 23:59 IST email delivery

**Gate assessment:** Authenticator/passkey live-device QA and scheduled email delivery evidence are outstanding.

### Phase 5 — Database & Production Hardening

**Status: NOT READY**

- ✅ PostgreSQL service defined
- ❌ Prisma uses PostgreSQL
- ❌ Public/API production ports documented
- ❌ SQLite → PostgreSQL reconciliation manifest

**Gate assessment:** SQLite remains canonical; no production cutover or reconciliation evidence exists.

### Phase 6 — Archive & Cleanup

**Status: BLOCKED BY GATES**

- ✅ Noolstitch source retained
- ❌ Weave source retained
- ❌ MSME ERP source retained
- ✅ Invoice Generator source retained
- ❌ Yarn Management source retained

**Gate assessment:** Blocked: three expected reference directories are absent, and there is no parity evidence or written retirement acceptance.

## Reference-folder safety check

| Reference | Path | Retained |
| --- | --- | --- |
| Noolstitch | `noolstitch/` | Yes |
| Weave | `Weave/weave/` | NO — investigate |
| MSME ERP | `MSME ERP/msme-micro-erp/` | NO — investigate |
| Invoice Generator | `Invoice Generator/` | Yes |
| Yarn Management | `Yarn/Yarn-Management/` | NO — investigate |

**Archive decision:** No reference folder is eligible for deletion based on current repository evidence.

