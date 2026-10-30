# Running-application review — 30 October 2026

Branch `claude/trusting-archimedes-wnea6j`, based on `6388b96`. Earlier reviews read the code and ran unit tests, but none ran the application in a browser. This one started the real stack on a disposable database, drove the business flow and adversarial inputs through the live API, and crawled every staff screen in Chromium at desktop (1440 × 900) and phone (390 × 844) widths. Defects found that way were fixed, tested and recorded in the [shared issue register](../2026-10-11/issue-register.md).

## How the application stands now

EverGreen's core works end to end on a clean database. A receipt became stock, a sales order reserved it, an inter-state invoice taxed it correctly, and two payments settled it with the customer ledger in agreement. Roles, retry keys, date rules and overpayment rules held under adversarial input. Closed accounting periods were not tested.

The main problems were ones a browser shows and a unit test does not. Every in-app screen was unusable on a phone. The sign-in and dashboard visuals failed without internet. A licence notice offered a dummy phone number. Tax state and rate could be wrong for out-of-state parties. The Tally export could send void invoices and invalid amounts to the accounts. Overdue-invoice alerts could never fire. All of these are now fixed.

It is still **not release-ready**. The open gates are the ones the [project status](../../PROJECT_AUDIT.md) already names: tenant-scoped provider sync, money stored as floating point, timestamp document numbers, missing server-side retry keys on orders and job work, recoverable off-site backups, the weighbridge simulation, statutory integrations, lint debt, and acceptance by a real operator, accountant and device.

| Area | Before this review | Now |
| --- | --- | --- |
| Phone use | All 34 in-app screens overflowed by 25–841 px; the menu took two-thirds of the width | No screen overflows; the menu is an overlay that closes after a choice |
| Offline install | Login and dashboard 3D scenes fetched lighting from a public CDN and crashed | Lit locally; an animated 2D fallback covers no-WebGL, loading and failure |
| Catalogue and customer input | Negative or 500% GST, negative prices, unknown types, bad GSTIN and email accepted | Rejected by the API with clear messages, and checked inline in the forms |
| GST type and rate | Order lines could replace the catalogue rate; seller state came from a per-invoice picker; GSTIN and state could disagree | Rate from the catalogue, seller state from the company GSTIN, customer state from their GSTIN |
| Tally export | Void invoices, allocations and reversals exported; `--` amounts; every ledger named 5% | Only real sales and receipts; ledgers named by rate; every voucher balances |
| Alerts | Overdue-invoice alerts could never fire; three different low-stock defaults | Alerts read live invoices; one default (500 kg) |
| Double clicks | Order, job-work, receipt, waste and cost buttons had no guard, and orders and job work have no server retry key | Buttons ignore repeat clicks while saving |
| Motion | No reduced-motion support; dark panels followed the OS, not the app | Reduced motion honoured everywhere; page transitions and a workflow animation added |

## How the review was done

1. **Baseline.** Installed dependencies, generated both Prisma clients, compared migrations with both schemas, type-checked and ran every test suite before changing anything. All passed; lint did not (see [verification](#verification)).
2. **Live API probe.** Started the customer API and web app with `npm run dev` against a freshly migrated SQLite file in a scratch directory. A script signed in as the bootstrap administrator, configured the company, and walked the flow with valid and invalid payloads, recording each status code. A second script checked VIEWER and MODIFIER permissions, invoice and payment retry keys, future dates, payment methods and supplier GSTINs.
3. **Browser crawl.** A Playwright script signed in through the form and opened all 35 staff routes, including the `/logs` alias and an unknown route, at both widths. For each it recorded page errors, console errors, failed API calls, horizontal overflow, alerts and a screenshot. Interaction scripts covered search, the customer dialog, phone navigation, Back/Forward and the workflow guide.
4. **Fix and re-check.** Each defect was fixed at its owning boundary with a regression test, then the probe or crawl was repeated against a restarted server.

Every database used was disposable and synthetic. No customer data, deployment or external service was touched.

## Business flows

| Flow | Checked | Result | Still open |
| --- | --- | --- | --- |
| Company setup | Issuer details, malformed GSTIN, invoice blocked until set | Works. Seller state must now match the GSTIN | Company identity on printed documents not checked |
| Material receipt | Catalogue receipt 100 kg; mill inward 10 bales; fractional bales rejected | Works | Weighbridge capture is simulated (INT-006) |
| Production | Date filter, Costing's cost per kg | `GET /production` ignored its dates and Costing called a missing route, so cost per kg always said "No production". Fixed | Mass-balance tolerance (BIZ-015), reversals in the ledger (BIZ-018) |
| Stock and dispatch | Over-stock order, dispatch without yarn stock | Rejected correctly | Mill and catalogue ledgers still reconcile through a bridge |
| Order to invoice | Rates, discounts, GST, intra- and inter-state split, retry key | Works; caller GST and seller state now locked | Invoice and order numbers are timestamps (BIZ-017); money is float (DB-004) |
| Collection | Partial and full payment, negative, overpayment, future date, unknown method, sub-paisa, replay | Works; ledger and balance agree; replay applied once | Bank reconciliation not built |
| Job work | Blank worker name | Rejected | No server retry key; screen now blocks double clicks |
| Accounts export | Tally export on live data with a void invoice and a bounced cheque | Correct after the fixes; all 14 vouchers balance | Ledger mapping, integration IDs, Tally acknowledgement (INT-002) |

The [business flow page](../../BUSINESS_FLOW.md#end-to-end-check) records exactly which checklist steps ran.

## Validation and business rules

Confirmed against the running API, then fixed:

| Input | Before | After | Test |
| --- | --- | --- | --- |
| Item GST −5% or 500%, price −10, type `BANANA` | 201 Created | 400 with the allowed range or list | `commerce-validation.spec.ts` |
| Blank item name on update; `gstRate: null` | 200; Prisma error | 400 | same |
| Customer GSTIN `NOT-A-GSTIN`, email `nope`, phone `12` | 201 | 400 | same |
| Customer with a Kerala GSTIN and no state | Stored as Tamil Nadu, so CGST + SGST instead of IGST | State taken from the GSTIN; a different state is rejected | same, `gst.test.ts` |
| Order line `gstRate: 0` on a 5% item | 201, tax-free order | 400: the rate comes from the catalogue | same |
| Invoice `sellerState` different from the company GSTIN | Used as given | 400 | same |
| Settings: GSTIN in Tamil Nadu, seller state Kerala | Saved | 400 | `settings.service.spec.ts` |
| Workflow supplier GSTIN `BAD` | 201 | 400 | live probe |
| Payment replay with `requestKey` | Recorded twice | Applied once (both key names accepted) | `commerce-validation.spec.ts` |
| CSV customer import with a mismatched state | Accepted | Row error | `gst.test.ts` |
| `GET /production?from=2026-02-30` | Filter ignored | 400; valid days filter whole local days | `production-history.spec.ts` |

GST rules live in one place, `packages/types/gst.ts`: GSTIN format, state codes, canonical state names and party contact checks. The API, CSV import and Business Desk forms all use it. The format check is structural and does not confirm registration with the GST portal.

Held correctly without changes: role enforcement (VIEWER cannot write or list users; MODIFIER cannot void), anonymous reads (401), duplicate SKU (409), over-stock orders, invalid order dates, future-dated invoices and payments, negative and over-balance payments, unknown payment methods, sub-paisa amounts, invoice retry keys with changed payloads, and whole-bale receipts.

## UI and design

| Defect | Fix |
| --- | --- |
| Phones: the 260 px permanent drawer left about 130 px for content, and `maxWidth` + `mx: auto` page roots sized themselves to their widest tabs | Overlay navigation below 900 px; page roots pinned to the column width; button rows and charts wrap |
| One page error replaced the whole shell, including navigation | Each page has its own error boundary; navigating away recovers |
| Screens opened at the previous screen's scroll position | Each screen opens at the top |
| Search: query not URL-encoded; stale responses won; failures silent; no "no matches"; Escape ignored; every other match highlighted | All fixed |
| Licence notice called +91 98765 43210 | Number comes from `VITE_SUPPORT_PHONE`; hidden when unset |
| Receipt history read `30/10/2026 ? CASH ? ?100` | ₹ and · restored; amounts to two decimals |
| Invoice form had an editable seller-state picker defaulting to Tamil Nadu | Read-only "Issued from", taken from the company GSTIN |
| Customer and item dialogs accepted anything until the server refused | Inline errors, GSTIN fills the state, Save disabled until valid |
| Payment Operations was headed "Business flows" | Own heading and subtitle |
| Labels such as `JOB WORK_MATERIAL` | Every underscore replaced |
| Menu tooltips promised live RPM and power, predictive forecasting and certificate tracking | Each says what the screen does, including what is not connected |
| Password show/hide button had no accessible name | Labelled |
| Dark glass panels followed the OS setting, not the app toggle | Follow the app theme; native controls switch too |

Unchanged and still worth attention: four overview screens compete for the landing role (Dashboard, Today, Business Workspace, Operations Command), 38 files hard-code colours (UI-022), the main bundle exceeds 500 kB (PERF-002), and Operations Command logs a React warning when its 3D canvas unmounts.

## Motion and 2D animation

Motion was added where it explains something, and removed for people who ask for less:

- **Reduced motion.** The stylesheet had many looping animations and no `prefers-reduced-motion` rule. A global rule now stops decorative motion and transitions while keeping state changes.
- **Workflow stations.** The "From material to payment" guide in Business Workspace and the Tutorial has a row of numbered stations. A token travels from receipt to payment to show the direction material and money move. Choosing a station opens that step and marks it current (`aria-current`). On phones the row scrolls on its own, and under reduced motion the token is hidden.
- **2D scene fallback.** An animated SVG yarn cone with a winding thread replaces the 3D scenes when WebGL is missing, while they load, or if they fail. It needs no network or GPU.
- **Page transitions and feedback.** Screens fade up over 0.22 s; search results and messages fade in; save buttons show "Saving…" while busy.

## Integrations

| Integration | State now | This review |
| --- | --- | --- |
| CSV master import | Implemented, ADMIN only | Customer state now canonical and checked against the GSTIN |
| Tally export | Implemented with documented gaps | Void and internal rows excluded, ledgers named by rate, balancing round-off, whole last day; verified on live data |
| Daily summary email | Implemented when SMTP is configured | Ran at 04:59 IST instead of 23:59 and counted one production run; now 23:59 server time, all runs. Set `TZ=Asia/Kolkata` |
| In-app notifications | Implemented | Overdue alerts fixed; local-day production check; one threshold |
| Provider licence sync | Opt-in, unauthenticated per tenant | Unchanged (EG-02) |
| Weighbridge | Library only; entry point simulated | Unchanged (INT-006) |
| e-Way Bill, e-invoice, payment gateway, WhatsApp/SMS, webhooks | Not built | Unchanged; documented as pending |

## Security

- Field encryption no longer has a committed fallback key; it refuses to run without `ENCRYPTION_SECRET`, which the container recipe already requires (SEC-002, partial).
- Changing your own password now signs out every other session in the same transaction (SEC-011, partial).
- CSV formula neutralisation was already in place and tested; the register now says so (SEC-015).
- Still open: no global request throttling (SEC-009), bearer tokens in `localStorage` (SEC-006), legacy plaintext password acceptance (SEC-010), the provider's shared key (SEC-003, UI-001), incomplete audit trail (SEC-013).

## Repository and tooling

- **Hosted CI on `main` was red.** The last five GitHub Actions runs, including the base commit `6388b96`, failed in the verify step on `apps/desktop/runtime.test.cjs`: it expected a `..\` path to be refused, which only happened on Windows. The desktop web server now refuses backslash and NUL on every platform, and `test:release` passes on Linux. The lint steps after verify will still fail (TEST-005).
- **Lint.** Request bodies in the catalogue and customer commands are now typed and checked field by field, so non-text descriptions and addresses are rejected. Customer API lint errors fell from 1,580 to 1,496; files changed here add none. Provider API (211) and customer web (428) remain.

- Removed 17 tracked legacy files under `apps/desktop/web-dist` and `apps/desktop/backend` (old bundles, a stale schema and lockfile). The release builder already rejected artifacts containing them.
- `node scripts/dev-evergreen.js` and `dev-all.mjs` now find npm beside Node, so they start on Linux and macOS without going through npm.
- The web image build accepts `EVERGREEN_SUPPORT_PHONE`; `.env.example` documents `ENCRYPTION_SECRET`, `TZ` and `VITE_SUPPORT_PHONE`.

## Register changes

New entries, all resolved in this branch: UI-023 (phone layout), UI-024 (CDN-dependent 3D scenes), UI-025 (dummy support number), UI-026 (corrupted ₹ and ·), UI-027 (search), UI-028 (shell-wide error), UI-029 (OS-driven dark styles), BIZ-022 (customer and storefront tax state), REL-011 (launcher on Linux and macOS).

Dated notes added: INT-001, UI-012, UI-018 and SEC-015 resolved; SEC-002, SEC-011, API-001, API-008, BIZ-020, INT-002, INT-010, UI-007, UI-015, UI-017, UI-019 and REL-009 partially resolved. The register's Markdown, JSON and CSV were updated together. They had already drifted from `finalize-register.cjs`, so the generator was not re-run.

## What remains, in order

1. **Data and money integrity.** Float money (DB-004), timestamp document numbers (BIZ-017), production mass tolerance (BIZ-015), and server-side retry keys for orders, job work and stock adjustments (API-008, EG-17).
2. **Recovery and deployment.** Off-site encrypted backups with a measured restore (EG-04), signed installers and host acceptance (EG-03, EG-11), and `TZ` set on every installation.
3. **Provider and tenant security.** Tenant-scoped sync credentials (EG-02), provider named-user login (SEC-003), throttling (SEC-009), and token storage (SEC-006).
4. **Statutory and accounting.** Tally ledger mapping and acknowledgement (INT-002), e-Way Bill and e-invoice (INT-003), and an accountant's sign-off on sample invoices and the Tally file.
5. **Quality gates.** Lint debt (TEST-005), a committed browser crawl in CI, and operator acceptance of the full flow (EG-15).

## Verification

| Check | Result |
| --- | --- |
| Migrations against both schemas | No differences |
| Type-check | Passed |
| Unit suites | 705 passed (customer API 353, customer web 219, provider API 94, provider web 11, weighbridge 28); 300 and 205 before |
| Customer HTTP suite | 22 passed |
| Agent, maintenance and release tests | 8, 6 and 23 passed |
| Generated docs and links | Current; 3,472 local links |
| Build | Every workspace built |
| Lint | Still failing: 1,496 / 211 / 428 errors (customer API / provider API / web) |
| Browser crawl | 72 page visits; 0 page errors, 0 failed API calls, 0 overflow |

The sandbox blocked `cdn.sheetjs.com`, so dependencies were installed with the registry `xlsx@0.18.5` for this run and the lockfile was left unchanged. The [validation record](../../PROJECT_AUDIT.md#2026-10-30-running-application-review) lists the full method and what was not done.
