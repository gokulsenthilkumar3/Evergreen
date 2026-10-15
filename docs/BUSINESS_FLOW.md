# Business flow

This page describes how material and money move through EverGreen, which screen owns each handoff, and how to check the flow end to end. For code ownership, see [architecture](ARCHITECTURE.md).

## Material and money flow

```mermaid
flowchart LR
  Receipt[Cotton or yarn receipt] --> Stock[Stock by item and lot]
  Stock --> Production[Production or job work]
  Production --> Output[Yarn, waste and work in progress]
  Output --> Release[Quality and dispatch checks]
  Release --> Dispatch[Dispatch]
  Dispatch --> Invoice[Invoice]
  Invoice --> Payment[Payment and customer ledger]
```

1. **Receive.** Record the supplier, lot, material and physical quantity. For weighed receipts, gross minus tare must equal net. Moisture and settlement follow the supplier's actual contract, not a fixed constant (see [cotton moisture research](COTTON_MOISTURE_RESEARCH.md)).
2. **Produce.** Record the lots consumed, yarn produced, recoverable waste and unfinished material. Input must equal output plus waste plus recorded loss. Correcting posted production must keep stock and journals consistent.
3. **Review and dispatch.** Check ownership, reservations, quality holds and available stock before releasing goods. A partial dispatch keeps its order and lot references. A second click or a retry must not deduct the same stock twice.
4. **Invoice.** Use the saved customer and issuer details and the line snapshot. Quantities, rates, discounts, rounding and tax must match the saved document. A PDF is not a statutory e-invoice or e-Way Bill.
5. **Collect.** Apply each payment to the right invoice, keep the remaining balance, and keep the customer ledger in step. Reversals and closed accounting periods follow explicit rules.

## Who owns each handoff

| Handoff | Screen | Check before moving on |
| --- | --- | --- |
| Company setup | Settings | Legal name, address and GSTIN are saved; invoices are blocked until they are |
| Material receipt | Inward / Batch, Operations Desk | Supplier, physical weight and receipt agree |
| Conversion | Production, Job Work | Input, output, waste and job-work returns reconcile |
| Dispatch readiness | Inventory, Outwards | Physical and committed stock have been reviewed |
| Sale | Business Desk | Customer, item, quantity, price and tax are correct |
| Collection | Business Desk, Reports | Payment is on the correct invoice and the balance agrees |

Commerce owns the catalogue stock ledger, orders, invoices and invoice-linked payments. Legacy mill inventory and production are bridged into that ledger by `stock-bridge.ts`, but are not yet proven to share every movement. Reconcile both, and never post a movement twice to make up for a gap. Bank reconciliation, statutory filing and live machine telemetry are not built.

## Business and workspace modes

| Business mode | Intended activity |
| --- | --- |
| `WAREHOUSE` | Receiving, storage, dispatch and related sales |
| `MILL` | Production plus related stock and costing |
| `PROCESSING` | Processing and job work |
| `INTEGRATED` | All of the above |

`GUIDED` and `FULL` set how much navigation is shown. The codes come from `packages/types/company-profile.ts`. They are preferences: server roles and command validation are separate, and there are no `TRADER` or `WAREHOUSE_ONLY` modes.

## BookEllam vocabulary

BookEllam ("all the books") groups the traditional mill registers so operators can find records in familiar terms.

| Book | Common term | Purpose |
| --- | --- | --- |
| Day book | Naal Kurippu | Daily transactions in order |
| Inward book | Varavu Puthagam | Receipts, supplier references and weights |
| Outward book | Vilpanai Puthagam | Dispatches and delivery references |
| Stock / lot book | Sarakku Puthagam | Quantities and lot history |
| Party ledger | Peredu / Khata | Customer and supplier debits and credits |
| Machine log | Yanthira Puthagam | Maintenance and inspection records |
| Waste register | Kasaadu Puthagam | Recoverable waste movements |

The [BookEllam page reference](wiki/pages/BookEllam.md) lists which registers are implemented. Several are still incomplete or mis-mapped (register UI-008, UI-009).

## End-to-end check

Run this on a disposable database, never on customer data.

1. Save issuer settings, a customer and a catalogue item. Confirm that missing issuer details block invoicing.
2. Receive material and check its balance. Record production and compare input with output and waste.
3. Review available stock, then dispatch. Confirm the ledger changes once for a valid sale.
4. Issue an invoice and download it. Confirm quantities and totals match the saved record.
5. Record a partial payment and check the balance. Record the rest and confirm the invoice and customer ledger agree.
6. Refresh Business Workspace. Compare invoice value, receivables and open orders with Reports.
7. Simulate an API failure. The workspace must warn that data may be stale, and never show a made-up status or a zero balance.
8. Check phone-width navigation, keyboard access to the guide, search with no results, and the browser Back button.

Business Workspace (`/workspace`) and the Tutorial (`/tutorial`) show the same searchable "From material to payment" guide, with links to each screen. This checklist is the acceptance test the pilot still has to pass. It has not all been run.
