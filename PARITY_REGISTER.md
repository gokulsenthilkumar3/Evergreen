# EverGreen One parity register (in progress)

This is a release gate, not a claim of parity. A visible tab is **not** proof that its workflow is integrated. No standalone source project may be archived or removed until every row is evidenced and accepted. Standalone business data is not imported in this merger.

Status key: **Connected** = uses EverGreen API/persistent records for its principal workflow; **Legacy** = separate EverGreen tables or write path still exists; **Prototype** = sample/local-only UI; **Unverified** = needs action-level QA and reconciliation.

| Current staff destination | Canonical owner / data source | Status | Required retirement evidence |
| --- | --- | --- | --- |
| Business Workspace, Dashboard, Today's Summary | Dashboard + Commerce reports | Unverified | KPIs reconcile to stock, orders, invoices and payments |
| Store | Catalogue / StockMovement | Unverified | Shares shop-visible items and on-hand quantities with `/shop` |
| Inventory, Inward / Batch, Outwards | Inventory legacy records → StockMovement | Legacy | Inward, production and dispatch quantities reconcile; no parallel writes |
| Production & Job Work | Production legacy records + JobWork | Legacy | One traceable production/job-work ledger and reversals |
| Job Work Register | JobWork challans + StockMovement | Connected | Partial receipt, scrap, cancel and outstanding tests |
| Operations Desk | Commerce inward + costing | Connected | Supplier receipts and stock movements reconcile |
| Costing | Legacy costing + Commerce costing sheets | Legacy | Single costing owner, linked production/job-work |
| Catalogue | Commerce catalogue | Connected | CRUD, media, archive, stock adjustments tested |
| Sales Orders | Commerce orders | Connected | Reservation, partial invoice and cancellation tests |
| Invoice Studio | Commerce invoices | Connected | GST, PDF, verification, payments, void and ledger tests |
| Customers & Ledger | Commerce customer ledger | Connected | Balances and aging reconcile to invoices/payments |
| Invoice Designer | Invoice Studio + shared `@evergreen/pdf` totals | Connected; prototype retired from navigation | Themes, logo, signatures, GST, print/PDF and verification are canonical; full live QA remains required |
| MSME ERP | Commerce summaries and related screens | Unverified | Each action mapped to canonical customer/finance workflow |
| Vyapari (B2B) | Hard-coded sample arrays | Prototype | Persistent customer portal and transaction history, or retire preview |
| Business Reports | Commerce reports | Connected | Date/product/receivable exports reconciled |
| Legacy Insights | Legacy billing/dashboard reads | Legacy | Replace with one reports destination |
| Yarn ERP Hub, Live Dashboard | Sample/static UI | Prototype | Real machine/production data or retire preview |
| Machine Management, Quality Control | Sample/static UI | Prototype | Registry, inspections, dispositions, history and tests |
| Shift Management, HR & Payroll | Sample/static UI | Prototype | Staff/shift/payroll domain services and permissions |
| Warehouse, Demand Forecasting | Sample/static UI | Prototype | Location ledger and forecast based on persisted demand |
| Supplier Portal, Compliance | Sample/static UI | Prototype | Role-specific supplier views and controlled document history |
| Helpdesk, Tutorial | Existing UI | Unverified | Persisted support workflow and bilingual action QA |
| User Management, Sessions, Security Settings, Settings | Auth/session/settings API | Connected | Every-role access tests, secret rotation and audit trail |
| Legacy Billing (removed from primary navigation) | Legacy invoice/payment tables, read-only API | Legacy | Reconcile historical invoices then retire UI; writes now return 410 |
| Public `/shop` | Commerce catalogue, orders, reservations | Connected | Published item → checkout → staff order → invoice → payment test |

## 6 October 2026 stock and business-flow corrections

See [BUSINESS_FLOW_REVIEW.md](BUSINESS_FLOW_REVIEW.md) for the current code-derived scenarios, actual database reconciliation and remaining workflow gaps. Inventory, commerce, storefront reservations and job work now use a shared stock transaction/reconciliation path. Imported stale cotton quantities were reversed with corrective ledger records; live stock reconciles to 890 kg cotton and zero yarn. Explicit dispatch billing prevents a second stock deduction. Dispatch/payment reversals retain history, partial order cancellation releases only the remainder, and warehouse allocation/transfer rules use actual catalogue stock.

Machine, quality, warehouse and HR destinations now have persistent APIs. Their earlier Prototype classification in this register is stale for their principal record-entry workflows. The later implementation below connects quality quarantine, WIP, company-owned transformation subcontracting, supplier accounting and valuation; execution-level integration and complete source-project data reconciliation remain unverified. The five reference projects are not yet fully merged or eligible for retirement. The review used business-flow derivation, not automated or browser scenario execution.

## Reference-project inventory and function-level comparison

The connected business-flow implementation is documented in [BUSINESS_FLOW_REVIEW.md](BUSINESS_FLOW_REVIEW.md). Returns/credit allocation, quality holds, intermediate completion, company-owned conversion, procurement/payables, journals/valuation, reserved-order dispatch and period controls now have persistent APIs and staff forms. Payment Operations opens these shared accounts; earlier browser-only financial drafts remain on the device with a download option for reconciliation.

[SOURCE_FUNCTION_INVENTORY.md](docs/SOURCE_FUNCTION_INVENTORY.md) inventories 497 discovered routes/screens and 106 reference Prisma models with canonical review destinations. No SQLite business snapshot was found in the retained source folders. External databases and browser data have not been silently imported. This inventory is structural evidence; action-level equivalence, source-data reconciliation and release acceptance remain outstanding.

| Source project | Scope to reconcile | Current retirement decision |
| --- | --- | --- |
| Noolstitch | Supplier inward, job-work dispatch/receipt, costing, stock reports | Retain; action-level comparison incomplete |
| Weave | Brands, categories, products, images, shop, customer/order management | Retain; public shop loads but empty-catalog checkout untested |
| MSME ERP | Customer profiles, ledgers, payments, bilingual finance UX | Retain; action-level comparison incomplete |
| Invoice Generator | Branded themes, logo/signature, GST lines, PDF/print, verification | Retain; designer remains a separate draft experience |
| Yarn | Procurement, warehouse, quality, production, HR, portals, documents, support, compliance | Retain; core record/stock/accounting paths are connected, remaining portal/compliance/support parity is unverified |

## Hard gates before any archive or deletion

1. Back up SQLite and reconcile every legacy quantity and currency balance with the unified ledgers.
2. Eliminate remaining active duplicate stock/production/costing writes, not only duplicate menu entries.
3. Complete every reference function row with owner, API/data source, working status, automated test and live QA evidence.
4. Test the full loop, cancellation/reversal, every role, Tamil/English, mobile, print/PDF and `/shop` checkout on port 4000.
5. Stage and verify PostgreSQL separately; one production origin/port is not yet proven.
6. Obtain acceptance, archive all five source folders and separately located data snapshots with a manifest outside the active workspace, verify archive, then remove only the exact approved folders.

As of this update, these gates **have not passed**. No reference folder has been deleted.

## Shared-package consolidation status

The following canonical packages now exist and are buildable workspaces. This is structural consolidation evidence only; it does not by itself satisfy any reference-project retirement gate.

| Package | Canonical responsibility | Current status |
| --- | --- | --- |
| `@evergreen/types` | Roles, yarn counts, sessions, stock movements, invoices, customers and dashboard contracts | Connected foundation |
| `@evergreen/config` | Shared strict TypeScript and baseline ESLint policy | Connected foundation |
| `@evergreen/i18n` | Typed English/Tamil core navigation and action dictionary | Foundation; full screen translation QA pending |
| `@evergreen/pdf` | Shared GST invoice total calculation used before rendering | Foundation; renderer integration pending |
| `@evergreen/email` | Escaped daily-summary email template | Foundation; scheduler/delivery integration pending |
