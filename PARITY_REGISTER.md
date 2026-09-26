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
| Invoice Designer | Browser-local invoice draft | Prototype | Appearance features folded into Invoice Studio; remove duplicate write path |
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

## Reference-project inventory still requiring function-level mapping

| Source project | Scope to reconcile | Current retirement decision |
| --- | --- | --- |
| Noolstitch | Supplier inward, job-work dispatch/receipt, costing, stock reports | Retain; action-level comparison incomplete |
| Weave | Brands, categories, products, images, shop, customer/order management | Retain; public shop loads but empty-catalog checkout untested |
| MSME ERP | Customer profiles, ledgers, payments, bilingual finance UX | Retain; action-level comparison incomplete |
| Invoice Generator | Branded themes, logo/signature, GST lines, PDF/print, verification | Retain; designer remains a separate draft experience |
| Yarn | Procurement, warehouse, quality, production, HR, portals, documents, support, compliance | Retain; current EverGreen Yarn tabs are largely prototypes |

## Hard gates before any archive or deletion

1. Back up SQLite and reconcile every legacy quantity and currency balance with the unified ledgers.
2. Eliminate remaining active duplicate stock/production/costing writes, not only duplicate menu entries.
3. Complete every reference function row with owner, API/data source, working status, automated test and live QA evidence.
4. Test the full loop, cancellation/reversal, every role, Tamil/English, mobile, print/PDF and `/shop` checkout on port 4000.
5. Stage and verify PostgreSQL separately; one production origin/port is not yet proven.
6. Obtain acceptance, archive all five source folders and separately located data snapshots with a manifest outside the active workspace, verify archive, then remove only the exact approved folders.

As of this update, these gates **have not passed**. No reference folder has been deleted.
