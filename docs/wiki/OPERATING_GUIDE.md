# How to run a company workspace

Start with [Quick Start](../../QUICK_START.md) for local installation and [the page index](README.md) for individual screens, tabs, handlers and API calls. This guide explains the business handoffs. It is not a claim that every historical screen is production-ready.

## Set up a new business

1. Sign in as the company administrator. In Settings → Company Info, save the company identity, business activities and workspace complexity. Choose Guided for a new team. Existing customers retain Full unless changed.
2. Open Business Desk and create a customer and catalogue item, or use Migration & integrations to map a CSV. Reopen the saved record to verify names, units and identifiers before transactions.
3. Complete the first relevant receipt or processing flow below, then inspect the stock or document record. This gives a visible result before configuring every optional module.

| Profile | Start with | Expand when needed |
| --- | --- | --- |
| Warehouse/trading | Customers/items → purchase/receipt → warehouse allocation → sales/dispatch → collection | Multiple warehouse locations, quality holds, supplier settlement |
| Mill | Cotton receipt → production/material balance → inventory → dispatch → invoice | Machine inspections, shifts/payroll, detailed costs |
| Processing/job work | Party/item setup → processing or conversion agreement → material reconciliation → work charge | Quality controls, partial returns, supplier allocations |
| Integrated | Shared master data and the appropriate flow for each operation | Full workspace for combined operations |

Guided mode reduces sidebar choices and workspace cards. It does not remove records, revoke API permissions or create a separate app. Full mode restores all modules. Existing warehouse locations are supported; independent multi-mill stock and cost scopes are pending the site architecture described in [Architecture](../ARCHITECTURE.md).

## Page responsibilities

| Page / tab group | What it owns | What to verify / limitation |
| --- | --- | --- |
| Business Workspace | Entry cards, report summary, shared searchable guide | Health status and stale-data warning; profile-filtered cards lead to existing modules. |
| Dashboard / Today's Summary | Recorded production, stock and cost summaries | Match the selected period to source records; a report is not machine telemetry. |
| Inward / Batch | Cotton gate receipts, batch reference and received quantities | Weight/bales, supplier and receipt timestamp; keep physical documentation. |
| Production & Job Work | Cotton consumption, yarn output, waste and intermediate material | Total input reconciles to output, waste and intermediate stock; chronological stock checks apply. |
| Inventory | Cotton, yarn and waste registers and related actions | Available quantities and ownership/holds, not only gross physical stock. |
| Outwards | Physical yarn dispatch, customer/vehicle information | Stock changes once; invoice linkage must not issue the same stock again. |
| Job Work Register | External worker/challan dispatch and returned material | Partial receipts, scrap and outstanding supplied material reconcile. This is not a complete incoming customer-owned processing ERP. |
| Operations Desk | Catalogue receipts, costing sheets, stock history | Choose the correct catalogue and receipt owner; do not duplicate cotton intake through two workflows. |
| Business flows | Purchases, returns, allocation, conversion, holds and period controls | Source document/line identity and remaining quantities must match; see action sequences below. |
| Business Desk | Catalogue, customer ledger, sales orders, invoices and payments | Invoice uses saved issuer and item data. Roles and transactional guards enforce mutations. |
| Payment Operations / Business Reports | Payment/receivable views and reporting | Match to invoice and ledger; bank reconciliation is pending. |
| Costing | Electricity, labour, packaging, maintenance and other expenses | Correct rate basis and posting date; allocated overhead cannot exceed recorded cost. |
| Store | Inventory-related store view | Inspect linked source before assuming an independent spare-parts ledger. |
| Warehouse | Locations and catalogue allocations/transfers | Receipt creates physical stock first; location allocation must not increase global stock. |
| Machine Management | Equipment register and inspections | “Active” is registry status. It does not mean a running machine or measured OEE. |
| Machine Status Overview | Asset/inspection view | No live RPM, energy or runtime connector is established. |
| Quality Control | Recorded inspection results and linked holds | A quarantined quantity remains unavailable until an authorized disposition. |
| Shift Management | Shift definitions and staff assignments | Verify assigned date, present/overtime and operator identity. |
| HR & Payroll | Staff and payroll records | Review rates, deductions and period before posting; no claim of full payroll-law compliance. |
| Demand Forecasting | Existing demand view | No validated predictive-model accuracy or planning automation is certified. |
| Supplier Activity | Existing supplier activity view | No external supplier login or continuous vendor integration is certified. |
| Compliance Readiness | Readiness/reporting view | This is not an official statutory filing or certificate. |
| Operations Command | 3D campus, 2D floor and radar plus records | Illustration and unavailable telemetry are labelled; read-only walkthrough described below. |
| Tutorial | Searchable workflow guide and training chapters | Follow actual forms and server validation where older tutorial language differs. |
| Helpdesk | Existing support view | A screen does not establish a staffed support SLA or external ticket integration. |
| User Management | Company users and three canonical roles | ADMIN manages access; a customer ADMIN is not a provider super-admin. |
| Sessions | Session inspection/revocation | Revoke the intended device; do not mistake a list of users for company isolation. |
| Security Settings | Authentication security options | Test recovery and session behavior when enabling MFA/passkeys. |
| Settings | Company, system defaults, rates, appearance, audit logs | API restricts company edits to ADMIN; local appearance is not a license entitlement. |
| Migration & integrations | CSV preview/commit, connector status, API guidance, import history | ADMIN only. Live external connectors are pending. |

The generated [page entries](README.md) enumerate literal tabs, actions and request paths, including composed components and retained legacy pages. Unmounted source is not a promised customer feature. The [UI control index](../reference/UI_CONTROLS.md) covers controls inside child components as well.

## Receive, produce and dispatch

1. Save cotton intake in Inward with the actual receipt timestamp. Verify the batch's remaining stock in Inventory.
2. Enter production after the selected material became available. Record consumed inputs, yarn output, named waste and intermediate material. Correct a material-balance or chronological error before saving.
3. If intermediate material remains, use Business flows → Complete intermediate stock with the WIP lot, consumed quantity, process loss, allocated processing cost and output lines.
4. Inspect quality. Linked holds can pause orders and release prior reservations when quarantine takes priority. Release/dispose only after review, then resume an order using released stock.
5. Dispatch physical goods once. Link invoicing to the dispatched quantities rather than issuing stock a second time. Compare stock before/after, the dispatch and the saved invoice.

Failures: insufficient released stock, customer-owned lots, closed periods or a posting timestamp before intake should block mutation. Fix the cause; do not manufacture an adjustment to bypass the error.

## Sell, invoice and collect

1. Select the saved customer and catalogue lines in Business Desk. Confirm quantities, units, rates, discounts and GST. Orders reserve eligible stock.
2. For separate delivery/billing, use Dispatch reserved order, then Bill order dispatch against remaining source quantities. For other invoice entry paths, review their physical-stock meaning before saving.
3. Download from the saved invoice record. Issuer snapshots preserve historical printed identity. A verification hash is an integrity aid, not government approval.
4. Record partial or full invoice payments and compare outstanding balance in Reports. Customer advance → Allocate customer credit handles unallocated receipts; Customer refund handles money returned.
5. Partial sales return uses original invoice lines, physical receipt/disposition and linked credit. Return unbilled dispatch is only for the unbilled delivery path. Cancel remaining sales order releases only its outstanding reservation.

Corrections: Reverse credit allocation restores credit/invoice balances; posted-expense corrections append a signed adjustment; ADMIN-only invoice void/payment reversal must be checked in the relevant API contract. Preserve original document references.

## Purchase and settle suppliers

1. Purchase order → Receive purchase → Supplier bill preserves purchase/receipt/bill line relationships. Partial receipts and bills use remaining source quantities.
2. For cotton already recorded through Inward, Bill an existing cotton receipt links verified cost evidence without receiving the cotton twice.
3. Supplier payment/advance → Allocate supplier payment settles the bill or conversion charge. Unallocated credit remains traceable.
4. Return to supplier uses original received lots and the related supplier bill. Allocate supplier return credit or Refund received from supplier records the settlement outcome.
5. Cancel purchase remainder closes future supply while retaining received, billed and paid records.

Verify quantities against receipt lines and money against payable journals. Returning goods and receiving a cash refund are distinct operations.

## Process or outsource material

Use Job Work for its current external challan flow. For transformation with an agreed output/yield and work charge, use Send conversion job → Receive converted output → settle the linked work charge. Account for consumed material, output, scrap/loss and remaining supplied material at each partial receipt. Customer-owned material must remain distinct from company-owned stock; never make it available for the company's sale solely because it is physically in a warehouse.

The business profile simplifies the screens for a processing company. Full incoming processing contracts, multi-site material custody and every industry-specific process are not delivered by the profile switch.

## Use the TV / animated player

Open Operations Command → 3D Campus. Play/Pause controls illustrative motion; Camera tour cycles through campus zones; 0.5×/1×/2× changes animation and tour timing. Selecting a zone or interacting with the camera stops the guided tour. Reset returns to the campus view.

TV fullscreen uses the browser Fullscreen API. Escape exits through the browser; a rejected or unsupported request displays a message and Cinema view remains available. Hidden/offscreen scenes pause continuous rendering; reduced-motion preferences disable automatic movement/touring. WebGL failure falls back to the 2D floor with the same motion preference.

Queries continue to use staff authentication. Display a VIEWER account on a shared TV and position the screen appropriately for company information. No separate TV enrollment, offline media download, MP4 export, telemetry integration or unattended device lifecycle is implemented. Vehicle/dock examples are illustrative; recorded dispatches live in Outwards. See [player tests](../../apps/web/src/components/command-center/CampusScene.test.tsx).

## Verification and support

Use a disposable rehearsal installation before migrating a running company. Confirm the intended company identity, saved record counts, stock ownership, accounting totals, printed output, role failures and restoration. On an API failure inspect the error and preserve the unchanged request key for an import retry. Check [validation evidence](../VALIDATION.md) for what was executed and what still needs real-device/provider acceptance.
