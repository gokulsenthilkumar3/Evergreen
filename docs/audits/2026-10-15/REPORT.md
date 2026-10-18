# Review and clean-up — 15 October 2026

Branch `GokulSenthilkumar/202610152245_Cleanup`, based on `0c6b128` plus the uncommitted provider-contract, license-sync and marketing work already in the checkout. This review covered architecture and flows, business validations and UI design, then removed dead material and consolidated the documentation.

Individual findings go into the [shared issue register](../2026-10-11/issue-register.md) through `finalize-register.cjs`, as in the 12 October follow-up. This report explains them, and it is not a second issue list.

## Summary

- **Architecture holds up.** The modular monolith, one installation per company, and domain-owned stock and ledger transactions are the right shape. The weak points are where the documents had drifted from the code, not the structure itself.
- **Business validations are mostly covered by the register.** I re-checked the high-risk paths (invoice creation, payments, voids, order reservations, Tally export, provider license sync) against the 130 application findings. The real gaps (client-chosen tax state and rate, timestamp document numbers, float money, uninvoiced-dispatch valuation, idempotency) are all already recorded. Five new findings are added below.
- **UI is uneven.** The staff app has a real theme but bypasses it in 38 files. The provider app is a single 2,842-line component whose console still fabricates results. The marketing site makes claims the product cannot back up.
- **The repository was mostly archive.** `0c6b128` tracks 1,643 files (65 MB). After removing archives, built bundles, video frames, one-off scripts and dead code, this branch tracks 592 (14 MB). The removed material is kept outside the repo.
- **Top-level Markdown went from 40 files (16 at the root, 24 in `docs/`) to 18 (2 at the root, 16 in `docs/`).** One index leads to guides, status, product and generated references. Dated evidence sits under `docs/audits/`.

## Architecture and flow review

| Area | Finding | Action |
| --- | --- | --- |
| Deployment model | Docs called SQLite "current" and PostgreSQL "only after measured demand", which contradicts the owner's 12 October decision (one PostgreSQL per customer) | Docs now state SQLite today and PostgreSQL as the decided target (DB-003, EG-26) |
| Two trackers | The EG-xx backlog and the register tracked overlapping items with no link between them | The backlog now maps every package to its register IDs and sends new defects to the register |
| Provider ↔ customer | License response handling is now safe (BIZ-005 resolved), but sync still targets `localhost` with no credential | Unchanged: EG-02, SEP-002, API-006 |
| Stock consistency | All stock writes go through `stockTransaction`; reconciliation still re-reads full history on every write | Unchanged: API-012 (P1), EG-08 |
| Roadmap evidence | `roadmap-audit.mjs` checked `machines/machines.module.ts`, but the file is `machine.module.ts`, so "Operational modules" always read MISSING | Fixed; the report now lives at `docs/reference/ROADMAP_EVIDENCE.md` |
| Desktop | `apps/desktop/web-dist` and `backend/` are stale packaged copies, but packaging depends on them | Kept; documented in desktop delivery (REL-009) |

## Business validation review

Re-checked against the code in this branch:

| Path | What holds | Still open (register) |
| --- | --- | --- |
| Order → reservation | Duplicate lines rejected, positive quantities, rate and discount bounds, available-stock check inside the transaction | Order number taken from the client or a timestamp (BIZ-017) |
| Invoice creation | Request key with payload hash, open-period check, issuer details required, order contract rate enforced, dispatch quantities capped | Seller and buyer state and GST rate can come from the request (BIZ-020); state names compared as text (BIZ-011) |
| Payments | Two-decimal amounts, method allowlist, no pre-invoice receipts, cannot exceed balance, idempotency key | Retry identity incomplete (BIZ-004) |
| Payment reversal and void | Reason required, double reversal blocked, void blocked while paid or credited, stock re-reserved for open orders | Void has no closed-period check on its credit-note date (covered by DB-010 time semantics) |
| Uninvoiced dispatches | — | Fixed ₹260/kg estimate; void-only invoices hide a dispatch (BIZ-013) |
| Tally export | Purchase vouchers correctly refused | Void invoices and reversals exported, `--` amounts, fixed 5% ledgers (INT-001, INT-002) |
| Provider license | DTO allowlists, atomic audit, enrollment key hidden | `licenseKey` still returned on reads (SEC-004, partial) |

## UI design review

- **Staff app (`apps/web`).** There is one MUI theme (`src/theme.ts`), but 38 page and component files hard-code hex colours, mostly the brand greens and status colours. Four overlapping overview screens (Dashboard, Today, Business Workspace, Command Center) compete for the landing role. Workspace stale-data and unavailable states are handled well.
- **Provider app (`apps/admin-web`).** Everything lives in one 2,842-line `App.tsx` with hand-written CSS. The console "terminal" printed made-up results for `health`, `backup` ("Backup created successfully") and `weighbridge` without calling the API, so an operator could believe a backup existed when none was made. That is now fixed: the terminal prints only provider API responses or says that nothing ran. Other simulated controls such as CI/CD remain (UI-003 partial, INT-008). Unused Vite template assets were removed.
- **Marketing (`apps/marketing-web`).** The in-progress redesign builds cleanly, but its copy promises fraud prevention, ROI and "100%" outcomes (new UI-021). `GO_TO_MARKET.md` lists the claims to avoid until their gates pass.

## New findings added to the register

| ID | Priority | Finding | Status |
| --- | --- | --- | --- |
| UI-021 | P1 | Marketing site promises capabilities that are not built | Open |
| BIZ-021 | P2 | Weighbridge library silently defaults the moisture base to 8.5% when the contract value is missing | Fixed: base required, 1 test |
| INT-011 | P2 | TSPL and ZPL label commands embed unescaped supplier, lot and mill text | Fixed: fields sanitised, 2 tests |
| UI-022 | P3 | Hard-coded colours in 38 staff-app files; 2,842-line provider and 1,737-line marketing components | Open |
| API-015 | P3 | Provider Swagger lists customer-module tags the provider API does not serve | Open |

Status notes were added to API-002, API-004, BIZ-005, UI-016, UI-020 and TEST-009 (resolved), SEC-004, UI-005 and UI-003 (partially resolved: the provider terminal is fixed, with 2 tests), and SEC-002, SEC-009, REL-001 and INT-006 (still open, re-confirmed).

## Clean-up

### Removed

| What | Files | Why |
| --- | --- | --- |
| `backups/` (source-project archive, plan snapshots, SQLite snapshots) | 771 tracked, plus 665 staged plan copies and 5 ignored `.db` files | Dead material; owner decision to remove it after an external backup |
| Built JS bundles under `docs/audits/2026-10-11/*-bundle*` | 185 | Build output (~9 MB), reproducible from history |
| `design-reference/` video frames | 6 | Frames from a third-party promotional video |
| Unreachable web code (Billing, Payments, InvoiceGenerator, MsmeErp, Vyapari, YarnERP, CostingHistory, CostingList, Signup, 19 billing, 4 payments and 11 common components) | 46 (~7,500 lines) | Not reachable from `main.tsx` (UI-020) |
| Unused web dependencies | `date-fns`, `@mui/x-date-pickers`, `zustand`, `html2canvas`, `react-to-print` | Imported only by the dead code |
| Stray scripts and logs | `cleanup_orphans.js` ×2, `test_delete_guards.js`, `source-parity-inventory.js`, `audit-markdown.mjs`, `packages/database/{clean-db,debug-prisma,deleteUsers}.js`, four Prisma output `.txt` logs, `apps/desktop/build_log.txt` | One-off dev scripts (one wipes all users) and captured logs |
| Vite template assets | `react.svg`, `vite.svg`, `hero.png`, unused provider `favicon.svg` and `icons.svg`, `App.css` | Unreferenced |
| Tracked `tsconfig.tsbuildinfo` ×2 | 2 | Build cache, now gitignored |
| `.agent/tasks` | 2 | Notes from another tool's finished task |
| Uncommitted Markdown inventory tooling (`documentation-audit.mjs`, `MARKDOWN_INVENTORY.json`, `document-retirements.json`) | 3 | Scanned other local worktrees, so CI could not reproduce it, and it depended on `backups/` |

Tracked files went from 1,643 at `0c6b128` to 592.

### Archive

Everything removed from the working tree is kept outside the repository at `D:\Projects\EverGreen-archive\2026-10-15\`:

- `backups/`: a copy taken before any change (1,452 files, 51 MB).
- `backups-working-copy/`: the original folder, moved out, including the ignored `.db` snapshots.
- `design-reference/`, `.agent/`: copies.
- `retired-docs/`: every retired Markdown file that had uncommitted edits.
- `uncommitted-tooling/`: the Markdown inventory script and its outputs.
- `SOURCE_COMMIT.txt`: the commit these copies were taken from.

Every other removed tracked file is also in git history at `0c6b128`.

## Documentation consolidation

| Before | After |
| --- | --- |
| `docs/ARCHITECTURE.md`, `docs/ARCHITECTURE_AND_BUSINESS_GUIDE.md`, `docs/AGENT_KNOWLEDGE.md`, `PROJECT_ARCHITECTURE_SPEC.md` | [Architecture](../../ARCHITECTURE.md) |
| `docs/BUSINESS_FLOW.md` plus the guide's flow, modes and BookEllam sections | [Business flow](../../BUSINESS_FLOW.md) |
| `docs/PROJECT_AUDIT.md`, `docs/VALIDATION.md` | [Project status](../../PROJECT_AUDIT.md) |
| `docs/IMPLEMENTATION_BACKLOG.md`, `docs/2030_ROADMAP.md`, `AUDIT_IMPLEMENTATION_PLAN.md`, `CURRENT_PROBLEMS.md`, `FEATURE_SUMMARY.md` | [Backlog](../../IMPLEMENTATION_BACKLOG.md) with a register map and long-term direction |
| `docs/GTM_TIRUPUR_KARUR.md`, `docs/PITCH_DECK_MILL_OWNERS.md` | [Go-to-market](../../GO_TO_MARKET.md) |
| `docs/INTEGRATIONS.md`, `docs/TALLY_XML_SPECIFICATION.md` | [Integrations](../../INTEGRATIONS.md) |
| `docs/MAINTENANCE_RUNBOOK.md`, `BACKUP_MIGRATION_MANIFEST.md` | [Maintenance runbook](../../MAINTENANCE_RUNBOOK.md) with a corrected online-snapshot procedure |
| `DESKTOP_GUIDE.md`, `BUILD_INSTRUCTIONS.md`, `CUSTOMER_DISTRIBUTION_GUIDE.md`, `DISTRIBUTION_READY.md` | [Desktop delivery](../../DESKTOP_DELIVERY.md) (they were already stubs pointing there) |
| `README.md`, `QUICK_START.md` | Rewritten. Quick Start now has working first-database and bootstrap-admin steps |
| `TEST_PLAN.md`, `TO_DESIGN.md` | Moved to `docs/TEST_PLAN.md` and `docs/OPERATIONS_MAP_DESIGN.md` |
| `BUSINESS_FLOW_REVIEW.md`, `PARITY_REGISTER.md` | Moved to [2026-10-06](../2026-10-06/BUSINESS_FLOW_REVIEW.md) as dated evidence |
| `docs/GATE_WORKFLOW_AUDIT.md` | Moved to [2026-10-11](../2026-10-11/GATE_WORKFLOW_AUDIT.md) as dated evidence |
| `MASTER_PLAN_AUDIT.md` (generated) | `docs/reference/ROADMAP_EVIDENCE.md` |
| `docs/SOURCE_FUNCTION_INVENTORY.md` (generated from the archive) | Retired with the archive |
| `docs/WEIGHBRIDGE_AGENT_ARCHITECTURE.md` | Rewritten to separate what exists from the target, and to drop the "SIMA/CCI standard" claim |
| `docs/README.md` | Rewritten as the single index |

The root now holds only `README.md` and `QUICK_START.md`. Workspace READMEs, `agent-system` context and skill cards, and the operating guide were updated to the new paths. Stale wiki pages for the deleted screens were removed and all references regenerated.

## Verification

Windows 11, Node 24.12.0 (CI uses Node 22).

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| Builds: web, admin-web, marketing-web | Passed |
| Audit script tests (`node --test scripts/audit.test.mjs`) | 6 passed |
| Agent policy validation | Passed (21 cards, 310 concerns) |
| Generated knowledge drift (`generate-knowledge --check`) | 0 stale |
| Documentation links (`check-knowledge-links`) | All local links resolve |
| `npm run verify` | Passed, exit 0 after 783 seconds |

### Full verify run

| Suite | Result |
| --- | --- |
| Migration/schema comparison, both databases | Passed |
| Provider API (Jest) | 81 passed in 6 suites |
| Provider web (Vitest) | 7 passed |
| Customer API (Jest) | 265 passed in 20 suites |
| Customer web (Vitest) | 205 passed in 25 files, 435 seconds |
| Weighbridge library | 25 passed |
| Customer HTTP tests | 22 passed in 2 suites |
| Agent planner tests | 8 passed |
| Audit script tests | 6 passed |
| Generated docs, roadmap and surface drift | Current |
| Workspace builds | Passed |

That is 619 tests passing. After the UI-003, BIZ-021 and INT-011 fixes, `npm run verify` passed again in 218 seconds with 624 tests (provider web 9, weighbridge 28). The web suite still has 205 tests after the dead-code removal because no test imported the deleted files.

## Not done

- Lint was not part of this pass (TEST-005 is still open).
- No browser, device or packaging acceptance was run.
- The marketing copy (UI-021), the remaining simulated provider controls (INT-008) and the hard-coded colours (UI-022) are recorded, not fixed.
- Nothing was committed or pushed.
