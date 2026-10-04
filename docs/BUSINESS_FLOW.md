# Business flow and acceptance checks

The active workflow is receive → produce → review stock → sell → invoice → collect. Business Workspace and Tutorial share a searchable guide with direct navigation to the relevant screens.

| Handoff | Owner screen | Check before continuing |
| --- | --- | --- |
| Company setup | Settings | Saved issuer identity and address are correct |
| Material receipt | Inward / Batch | Supplier record, physical weight and receipt agree |
| Material conversion | Production / Job Work | Input, output, waste and external returns reconcile |
| Dispatch readiness | Inventory / Outwards | Physical stock and committed quantities have been reviewed |
| Customer sale | Business Desk | Saved customer, catalogue item, quantity, price and tax are correct |
| Collection | Business Desk / Reports | Payment belongs to the correct invoice; remaining balance agrees |

## Boundaries

Commerce owns its catalogue ledger, orders, invoices and invoice-linked payments. Legacy mill inventory and production are not yet proven to share every stock movement with commerce. Reconcile both ledgers; do not post the same movement twice to compensate for uncertainty. Bank reconciliation, provider-backed statutory filing and live machine telemetry are not established capabilities. The parity register remains the release authority.

## Verify using a disposable test database

1. Save issuer settings and a customer/catalogue item. Confirm missing required details block invoice issuance.
2. Receive material and verify its recorded balance. Record production and compare input, output and waste.
3. Review available stock before dispatch. Confirm the relevant ledger changes once for a valid sale.
4. Issue an invoice and download its saved document. Confirm quantities and totals agree with the record.
5. Record a partial payment; confirm the remaining balance. Record the remainder and confirm the invoice and customer ledger agree.
6. Return to Workspace and refresh. Compare invoice value, receivables and open orders with Reports.
7. Simulate an API failure. Confirm the workspace warns about stale data and never invents an operational status or zero balance.
8. Check phone-width navigation, keyboard access to guide accordions, search with no results and browser Back after opening a workflow step.

This checklist documents required acceptance work; it does not claim these operational checks have all passed.
