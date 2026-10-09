# EverGreen business flow review — 6 October 2026

EverGreen has one application shell and several persistent business modules. It does not yet have complete workflow or data parity with Yarn, Weave, Noolstitch, MSME ERP and Invoice Generator. This review traces business scenarios through the code, identifies inconsistent states and records the corrections. The numerical scenarios below are derivations, not executed transactions. No browser, Playwright or scripted business-scenario tests were used for this review.

The live database was backed up before reconciliation: `backups/pre-stock-sync-20261006-212553.db`. SQLite reported its integrity as `ok`. Before the fix, CottonInventory held 890 kg, YarnInventory held zero, while the catalogue showed 13,458 kg from four imported movements whose cotton source records no longer existed. Reconciliation retained those four movements, appended four correcting movements and added the live receipt to the catalogue. The observed result was 890 kg cotton and zero yarn, with both obsolete batch balances at zero.

## What exists and what owns it

| Business responsibility | Current implementation | Rule that should govern it |
| --- | --- | --- |
| Receive cotton | InwardBatch and CottonInventory | Receive kilograms and recorded bales against one identifiable batch and receipt timestamp. |
| Manufacture yarn | Production, consumption/output rows, cotton/yarn/waste ledgers | Cotton input equals yarn, waste and explicitly recorded intermediate output. Derive totals from rows. |
| Sell catalogue products | CatalogueItem and StockMovement | Purchased products and manufactured yarn need real receipt/output movements. A catalogue entry alone supplies no stock. |
| Stock bridge | Shared transaction wrapper and stock reconciliation | Import inventory changes once; mirror commerce movements for linked manufactured yarn once; append corrections to imported history. |
| Reserve an order | SalesOrderLine and reservedQty | Reservation reduces available stock, not physical on-hand stock. Invoice only the unfulfilled balance. |
| Dispatch bags | Outward and YarnInventory | Dispatch reduces physical yarn once. Standard bag dispatch uses 60 kg per bag. Loose yarn can be sold in kilograms. |
| Bill a dispatch | Invoice.outwardId | Bill quantities already dispatched without another deduction. Other yarn counts and overbilling are rejected. |
| Direct stock sale | Invoice with no outwardId | Invoice records delivery and deducts physical stock. Billing date and delivery timestamp are distinct. |
| Partial payments | Payment, Invoice.amountPaid and CustomerLedgerEntry | Receipts reduce debt, never stock. Reject overpayment and invalid amounts; repeated request keys must not duplicate receipts. |
| Reverse a receipt | Negative Payment with original-payment reference, debit ledger entry | Retain the original receipt; restore debt once. This records a correction/refund, not a bank transfer. |
| Reverse dispatch | Outward status and positive yarn reversal | Void dependent invoices first; confirm physical return; retain dispatch history and avoid duplicate returns. |
| External job work | Challan, dispatch/receipt/scrap rows, StockMovement | Track dispatched = received + scrap + outstanding. Return only outstanding material on cancellation. |
| Warehouse | Location movements and catalogue stock | Locations allocate existing company stock; they cannot create stock. Transfers need source and destination. |
| Quality, machines and HR | Real API-backed records | Persistent records are present, but complete links to stock eligibility, production cost and payroll accounting are not proven. |

The stock bridge applies to legacy cotton and yarn linked to manufacturing inventory. Other catalogue products remain in StockMovement; they are not silently treated as cotton batches or manufactured yarn counts. Cotton movements remain under Inward and Production, where batch and bale information exists. Store excludes raw cotton and offers available yarn, finished goods and services. Public shop publication remains a separate explicit catalogue setting.

## Scenario derivations and corrections

Each corrected row was reviewed against its service and related write paths. “Corrected” means the code was changed and compiled; it does not claim execution of the example.

| Scenario | Required resulting state | Review result |
| --- | --- | --- |
| Import a receipt, then remove its inventory source | Catalogue loses the source quantity; imported history remains visible | Corrected with appended reconciliation entries. |
| Receive another cotton batch | Inventory and catalogue increase together | Corrected through the shared transaction. |
| Retry startup/reconciliation | Previously reconciled quantities do not accumulate again | Reconciliation compares source quantities with net imported movements. |
| Read cotton/yarn inventory endpoints | Return actual stock, rather than fixed empty arrays and zero | Corrected. |
| Produce 360 kg yarn, 30 kg waste and 10 kg intermediate from 400 kg cotton | Cotton −400; yarn +360; waste +30; intermediate explicitly recorded | Server totals now derive from rows and enforce the UI's 0.01 kg material balance. Intermediate is recorded, not yet an independent WIP ledger. |
| Supply a false totalProduced with different output rows | Reject incorrect balance or derive truthful totals | Corrected by deriving totals from rows. |
| Consume the same batch in multiple rows | Validate their combined kilograms and bales | Corrected by grouping requests before validation. |
| Supply bogus bag totals | Bag count follows yarn weight; 100 kg means one standard bag and 40 kg loose | Output bags and loose weight are derived on the server. |
| Receive cotton and start production immediately | Reject a start before the configured settling interval, preserving the entered form | Receipt/start timestamps and the configured interval are shared. |
| Dispatch today after production today | Compare actual event times, not artificial midnight | Receipt/dispatch time controls added; legacy date-only stock callers use the current local clock on the selected date. |
| Read historical batch availability | Historical bale usage follows the requested cutoff | Corrected for the available-batch response. Later dependencies still protect against overspending when posting backdated entries. |
| Reserve 180 kg from 360 kg | On hand 360; reserved 180; available 180 | Retained and protected across inventory and commerce writes. |
| Dispatch reserved yarn through the unrelated bag screen | Do not consume another order's allocation | Transaction guard rejects it; dispatch availability excludes reservations. |
| Invoice 120 kg against a 180 kg order | Deduct 120 kg and release only 120 kg reservation; 60 remains reserved | Existing partial invoice behavior now shares the inventory projection. |
| Cancel the remaining 60 kg after partial invoicing | Release 60; preserve the 120 kg sale | Added CANCELLED_PARTIAL state and remainder-only release. |
| Void that invoice after the remainder was cancelled | Return sold stock without recreating a cancelled reservation | Corrected using the order's closed state. |
| Dispatch 120 kg and invoice it in two 60 kg parts | Physical deduction remains 120, not 240; billed quantity cannot exceed 120 | Explicit outward link and cumulative billing check added. |
| Void a dispatch-linked invoice | Reverse debt only; goods stay dispatched until physical return | Corrected. |
| Reverse a still-billed dispatch | Reject until all its linked active invoices are voided | Corrected using explicit links, replacing customer/date guessing. |
| Reverse the same dispatch twice | Return stock once | REVERSED status makes retries harmless. |
| Record ₹5,000 against a ₹12,600 invoice | Paid ₹5,000; debt ₹7,600; no stock change | Finite amounts, two-decimal precision and balance checks added. |
| Retry the same receipt request | No duplicate cash receipt or ledger credit | Optional request-key handling added; payment UI supplies keys. |
| Reverse the ₹5,000 receipt twice | Debt restored once; original receipt retained | Original-payment reference and repeat protection added. |
| Void a paid/part-paid invoice | Require receipt reversal first | Guard retained; receipt reversal now available from the UI. |
| Dispatch 120 kg to job work; receive 90 and scrap 10 | On hand increases 90; outstanding is 20 | Finite receipt checks added; same-material quantity accounting retained. |
| Receive only scrap, with no usable material | Record scrap and reduce outstanding without creating usable stock | Zero usable quantity with positive scrap is now accepted. |
| Cancel that partial job after the remaining 20 kg returns | Return 20, retain received 90 and scrap 10 | Cancellation requires return confirmation and is safe to repeat. |
| Allocate 300 kg to locations with only 200 kg on hand | Reject fictitious location stock | Warehouse allocation now checks catalogue stock. |
| Transfer 100 kg from A to B | A −100; B +100; company stock unchanged | Paired location entries are posted atomically. |
| Sell/consume stock still allocated to a location | Require its release for use first | Allocation invariant prevents location stock exceeding company stock. |
| Recycle waste into cotton | Deduct waste and create a selectable cotton batch | Recycled cotton now receives a unique RECYCLE batch with zero packed bales. |
| Reverse recycled cotton already consumed/merged | Reject until dependent production/merge is reversed | Unique linking and dependency checks replace ambiguous date/weight matching. |
| Reverse one merge among several | Preserve unrelated merge productions | Removed the broad SYSTEM_MERGE deletion. |
| Change a stocked item's unit/type or a linked inventory SKU | Preserve quantity meaning and links | Protected; create a different item for a different material/unit. |
| Mix foreign-currency invoices into an INR balance | Reject until currency-aware accounting exists | Unified invoicing now enforces INR. |
| Show green health while source/catalogue disagree | Report drift from measured stock sums | Detailed health compares source and catalogue balances; fabricated latency/validation claims removed. |

For the order example: start with 360 kg yarn, reserve 180, invoice 120, then cancel the remaining 60. The resulting physical stock is 240, reserved stock is zero and available stock is 240. Reversing its receipts changes money only. Voiding that invoice restores the 120 kg and leaves the cancelled reservation at zero.

For the job-work example: 360 −120 +90 +20 = 350 kg on hand after receipt and cancellation; the separately recorded 10 kg scrap accounts for the remaining material. A second cancellation must leave 350 unchanged.

## Gaps identified before the implementation below

This table records the gaps found during the first review. The following implementation update supersedes their original status. Complete reference-project parity still requires source data and release evidence.

| Priority | Needed flow | Current limitation / next design |
| --- | --- | --- |
| High | Partial sales returns and credit notes | Full invoice void is supported. A partial return needs original-line quantity limits, physical inspection/receipt, tax credit document, refund/credit allocation and its own state. |
| High | Quality quarantine and release | Inspections persist, but they do not reserve/quarantine a specific stock lot. Add explicit lot/quantity holds and release rules before claiming quality-gated shipment. |
| High | Intermediate/WIP completion | Intermediate weight is recorded, but there is no ledger for later conversion into finished yarn. Introduce WIP lots, process loss and completion consumption. |
| High | Transformation subcontracting | Current job work returns the same item. Yarn→fabric or fabric→garment needs input/output item mapping, yield/BOM rules, waste, work charges and ownership. |
| High | Procurement and supplier payable loop | Receipts exist; linked purchase orders, partial supply, supplier bills, returns and payable settlement are incomplete. |
| High | Financial documents and valuation | The customer ledger is receivables tracking, not a full double-entry general ledger. Stock valuation and production/job-work cost allocation need a consistent costing policy. |
| Medium | Ordered dispatch then separate invoicing | Order conversion currently performs invoice-led delivery. Standalone bag dispatch can be billed separately, but cannot consume a particular sales-order reservation. Add order→dispatch fulfilment links before joining those branches. |
| Medium | Variants and lot traceability | Manufactured yarn is grouped by count. Grades, colours, ownership, lots and brand variants need explicit stock identities; names must not be used as identity. |
| Medium | Advances, excess payments and allocations | Current receipts settle one invoice and reject overpayment. Add customer advances and allocation records before accepting excess/unallocated payments. |
| Medium | Warehousing fulfilment | Allocation/transfer checks exist; automated picking, packing and stock-event location links remain open. |
| Medium | Closure controls | Accounting-period locks, duplicate invoice request handling, durable blocked-action audit and scaling reconciliation to affected rows need follow-up. |
| Medium | Commercial amendments and partial discounts | Invoice terms remain editable. Order-wide discount allocation and cumulative concessions across partial invoices need an explicit contract/amendment policy. |
| Medium | Source-project retirement | Map every reference-project function and reconcile its business data. Source folders remain retained; no complete archival/retirement acceptance exists. |

These target flows were inferred from EverGreen's domains and compared with primary ERPNext documentation. Its [sales invoice workflow](https://docs.frappe.io/erpnext/sales-invoice) distinguishes billing delivered goods from invoice-led stock delivery; its [sales return workflow](https://docs.frappe.io/erpnext/sales-return) separates physical returns and credits. [Payment entries](https://docs.frappe.io/erpnext/payment-entry) cover allocations/advances, while [subcontracting](https://docs.frappe.io/erpnext/subcontracting) provides a reference for material supply and conversion. These comparisons inform the proposed design; they do not establish EverGreen compliance or parity.

## Evidence and limits

The local additive dispatch/invoice migration was applied and recorded; generated Prisma types were refreshed. The application and Database Studio were restarted. API/web compilation, SQLite integrity and read-only balance diagnostics provide implementation/startup evidence. No fictitious receipts, production runs, invoices, payments or dispatches were inserted into the user's business database to claim scenario passes.

The restart passed the public-port health check at `http://localhost:4000/api/backend/health`. Public health exposes service/status; the stock amounts were checked separately against the database: physical and catalogue cotton both held 890 kg, with zero yarn. StockMovement remained at nine records across reconciliation startups, with no duplicate corrections. SQLite integrity returned `ok`. The API and web builds passed; the web build retains its existing large-chunk warning.

The derived scenarios still need execution-level coverage before release assurance. In particular, concurrent posting, network retries, permissions for every role, PDFs/tax documents, Tamil/English and migration of standalone project data are not proven by this code review. Full reference-project parity remains open.

## Implementation update — connected business flows

Payment Operations now opens the same server-backed financial accounts. Earlier browser-only vendor/journal/bank/payment-link drafts are retained in browser storage and can be downloaded for reconciliation; they are not presented as posted company balances.

The staff navigation now includes **Business flows**. It uses authenticated APIs, immutable operational documents and source-line links, company stock lots, WIP records and balanced journal entries. Posted documents have request keys and payload fingerprints: retries return the same document, while reuse with different details is rejected. All stock/document/accounting changes commit or roll back together. No sample sales, purchases, payments or productions were inserted into the business database for verification.

| Original gap | Implemented path and rule | Remaining evidence / boundary |
| --- | --- | --- |
| Partial returns / credits | Original invoice-line caps, proportional tax/discount credit, physical confirmation, original issue cost, damaged-quantity holds, credit-note PDF, refund or transfer of refundable credit | Code-derived review; invoice/credit rendering and tax filing need release review |
| Quality holds | Explicit lot and held quantity; failed/held inspections quarantine stock; inspection decision releases it; shop, orders and job work exclude unavailable quantities | Measurement defaults are blank; no fabricated test readings |
| WIP | Production creates intermediate lots; partial completion consumes WIP into output plus explicit loss; full loss is supported; moving-average material and allocated overhead costs follow completion | Missing raw-material cost remains explicit and prevents closure |
| Conversion subcontracting | Supplied input-line contract, expected output, yield tolerance, partial input consumption/output, losses, contract charge caps, company ownership and outstanding-material return | Company-owned conversion is supported; outside-yield receipts need contract resolution |
| Procurement/payables | Purchase order → partial goods receipt → supplier bill → payment/advance allocation; original-lot returns → supplier credit allocation/refund; cancel remainder preserves history | Cotton receipts create selectable bulk cotton batches, not duplicate catalogue-only stock |
| Accounting / valuation | Balanced receivable, sales/tax, cash/bank, payable/input-tax, inventory, manufacturing/WIP, overhead and payroll-accrual entries; moving-average stock valuation and original-cost returns | Unknown opening/purchase costs are not invented; bank reconciliation, FX and statutory filing are separate workflows |
| Ordered delivery | Order → pick/packing release → dispatch using its reservation → separate partial invoice without another deduction; unbilled dispatch return is explicit | Direct delivery and ordered dispatch both count towards delivered quantity; cancelled remainders stay closed |
| Lot variants | Stable item and lot identities with grade, colour, ownership and origin; issues use released company lots; lots can be selected for dispatch/conversion | Cotton is managed by batch; stock units and managed SKUs remain protected |
| Advances / allocation | Unallocated customer and supplier payments, capped allocations, paid-return credit transfers/refunds, customer allocation reversal with source trail | Recording a refund documents an actual money movement; it does not send money through a bank |
| Warehouse fulfilment | Persisted order picking documents release source-location stock for packing; location transfers remain paired and dispatch changes company stock once | Physical packing is a staff operation; no carrier integration is asserted |
| Closure / audit / scaling | Admin period locks preserve closed postings, invoice request keys, denied-write audit outside rollback; invariant checks and valuation use affected items plus pending costs | Source reconciliation still performs a complete consistency scan at transaction entry |
| Commercial terms | Order rates/taxes govern invoice conversion; proportional concessions with final-part rounding; admin pre-delivery discount amendment and immutable posted-expense corrections | Later price/quantity changes require an explicit credit/correction |
| Source projects | Reproducible route/screen/model inventory with destination mapping: [SOURCE_FUNCTION_INVENTORY.md](docs/SOURCE_FUNCTION_INVENTORY.md) | Destination mapping is not action-level equivalence or external data import; retained projects remain preserved |

### Derived scenarios for the new paths

These examples were followed through service branches and ledger rules, not executed as transactions.

* Invoice 120 kg at ₹100/kg plus 18% tax: ₹14,160. A 30 kg return credits ₹3,540 and receives 30 kg once. With ₹6,000 previously received, debt becomes ₹4,620. With the invoice fully paid instead, ₹3,540 becomes refundable/allocatable credit. Refunding it reduces recorded paid amount to ₹10,620 and does not move stock again.
* Order 180 kg, dispatch 120 kg, then cancel the 60 kg remainder: release only 60 kg reservation; billing the delivered 120 kg causes no further deduction and cannot reopen the cancelled remainder. Voiding that bill leaves the dispatch physically outstanding until its return is confirmed.
* Purchase 100 units at ₹50 plus 18% tax; receive/bill 60: stock +60, receipt asset ₹3,000, payable ₹3,540. Pay ₹4,000 and allocate ₹3,540: ₹460 remains advance. Return 10 from the original lot: stock −10 and supplier credit ₹590. Refund/allocate that paid credit separately; the original payment remains intact.
* Convert 40 kg WIP into 38 kg output and 2 kg process loss: remaining WIP −40, output +38, mass accounted for. Finished-output cost absorbs that input cost and recorded process overhead. A full-loss completion creates no finished stock.
* Supply 120 kg to conversion work and receive 110 kg with 10 kg loss: input/output account for 120 kg, charged amount cannot exceed the contract, output carries the supplied material cost plus its work charge. Cancelling later returns only unconsumed original input.
* Repeating a posted request returns its existing document; a changed payload with the same key fails. Closed-period source edits, excess source-line returns, duplicate allocation reversal and consumption of held stock fail before commit.

### Final cross-flow corrections

* Quarantine takes precedence over existing sales reservations. An affected order moves to ON_HOLD, with its actual remaining reservations released across all lines. Resuming it must reserve the outstanding requirement again from released stock. Picking and dispatching held orders are blocked; a dispatch return does not recreate reservations on a held or cancelled order.
* Returning 20 of a 50-unit quarantine to the supplier closes the original hold with RETURNED_TO_SUPPLIER and retains a 30-unit successor hold. This records disposal, not a false inspection pass. A disposed hold cannot subsequently be released.
* A manually entered cotton receipt can link to a supplier bill with verified purchase cost and evidence. Its original receipt movement supplies the stock: linking and billing do not receive its kilograms again.
* Conversion work charges are payable documents and can use the same supplier advance/payment allocation as goods bills. Purchase-order service lines can be billed directly into overhead and supplier payable without a fictitious warehouse receipt; material lines still require a goods receipt.
* Cumulative picking cannot exceed an order line's agreed quantity, even across separate picking documents. Picking and invoicing cannot precede the source order/dispatch. Pre-invoice customer payments use the advance workflow, then allocation.
* Verified costs target an individual external receipt, rather than assigning one price to every receipt of the item. Pending production, conversion and return costs derive from their original inputs/issues when those costs become known. Missing evidence stays visible.
* With ₹1,000 recorded overhead, allocating ₹800 to production immediately leaves ₹200 available, even when its cotton cost is pending. Another ₹800 allocation is rejected. A full production loss posts material and allocated overhead to PROCESS_LOSS when cost evidence becomes available.
* Returning ten units billed at ₹100 when moving-average stock cost is ₹120 removes ₹1,200 inventory and credits the supplier's ₹1,000 base. The ₹200 difference posts to PURCHASE_PRICE_VARIANCE, rather than leaving an unexplained inventory-clearing balance.

These are code-derived state and accounting checks. They were not executed as sample transactions against the company's database.

### Observed database and startup evidence

Backup: `backups/pre-workflows-20261006.db`. Additive migrations introduced operational documents/lines, suppliers, lots/holds, WIP, journals/valuation, period locks and explicit invoice fulfilment links. Generated Prisma types and schema validation passed. The first startup exposed a historical lot-assignment edge case; its transaction rolled back and the corrected startup succeeded on port 4000.

Read-only diagnostics observed SQLite integrity `ok`, no foreign-key violations, 890 kg cotton in both physical and catalogue ledgers, zero yarn, three inventory lots and nine stock movements. Eight cancelled imported movements have neutral valuation; the single live receipt remains unvalued because its purchase-cost evidence is absent. No operational documents or financial journals were invented to make examples appear tested. Static compilation and production builds provide build evidence; they do not prove transaction scenarios or merger acceptance.

Final verification after the cross-flow corrections: API TypeScript check, Nest production compilation, shared types/PDF package builds, web production build and Prisma schema validation passed. EverGreen restarted successfully on port 4000 with internal API 4301; public health reported evergreen-api/ok. Database Studio was restored on port 5555 and returned HTTP 200. All four additive workflow migrations are recorded as applied. The read-only balance/integrity counts above remained unchanged. Git's whitespace check reports existing whitespace in the embedded API landing-page CSS and Database Studio changes; those unrelated blocks were preserved.
