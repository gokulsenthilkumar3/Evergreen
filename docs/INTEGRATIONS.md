# Easy migration and integration contracts

“ECC/VCC/VCCC” in the original dictated request means **easy**, not SAP connectors. Warehouses and mills are the intended facilities. This design assumes “Eway” means e-Way Bill; an eBay marketplace connector is not implemented or promised.

## Delivered master-data import

Source: [shared parsing/mapping](../packages/types/migration.ts), [API service](../apps/api/src/modules/integrations/integrations.service.ts), [UI](../apps/web/src/pages/Integrations.tsx).

| Endpoint | Role | Behavior |
| --- | --- | --- |
| POST `/integrations/imports/preview` | ADMIN | Validate headers, rows and explicit field-to-column mapping; return normalized records, row errors and ignored columns; no persistence. |
| POST `/integrations/imports/commit` | ADMIN | Revalidate; import customer or catalogue master records atomically; record source, fingerprint, IDs and authenticated actor. |
| GET `/integrations/imports` | ADMIN | Latest 50 batches, newest first. |

Requests use staff bearer authentication and the browser proxy prefix `/api/backend`. Payload example:

```json
{
  "entity": "customers",
  "headers": ["Old party field", "Telephone"],
  "rows": [["Example customer", "0123456789"]],
  "mapping": { "name": 0, "phone": 1 },
  "source": "Old register",
  "requestKey": "11111111-2222-3333-4444-555555555555"
}
```

Preview does not require `source` or `requestKey`. Commit requires a non-empty source name up to 200 characters and a 16–100 character request key made of letters, digits or hyphens. Reuse a key when retrying the same submission. Reusing it for different normalized data returns a conflict. A fingerprint of source, entity and normalized records prevents the same batch from being imported again under a new key. Existing SKU or case-insensitive customer-name conflicts abort the whole batch; no automatic overwrite or fuzzy party merge occurs.

CSV: UTF-8, optional BOM, comma delimiter, quoted fields including embedded line breaks and doubled quotes. Maximum file size 500 KB, 1–50 distinct non-empty headers, 1–500 data records, consistent row widths. JSON cells must be strings at most 2,000 characters. Every source column maps to at most one supported field; unrecognized headers require human mapping.

Customer fields: name (required), phone, email, GSTIN, state and address. Catalogue fields: SKU, name, type and UOM (required), HSN/SAC, GST rate and sale price. Missing optional numeric values default to zero and are shown in the preview. Item types are RAW_MATERIAL, YARN, FINISHED_GOOD, JOB_WORK_MATERIAL or SERVICE. No customer state is invented when omitted. Tax format checks are validation, not statutory verification.

The importer creates master data only. Opening stock, lots, ownership, historical invoices, payments and balances require separate reconciliation using canonical business commands. Importing a spreadsheet must not silently post quantities or reconstruct financial history from ambiguous columns. Original files remain on the user's device; imported columns persist in the company database and audit history retains IDs/source, not a duplicate raw file.

## How to migrate an old register

1. Export a copy as UTF-8 CSV. Keep the original unchanged. If starting from paper, enter master records into a spreadsheet with one record per row.
2. Sign in as company ADMIN and open Migration & integrations → Import data. Select Customers or Catalogue items, enter a source name and choose the file.
3. Map every required field. Read ignored-column warnings and normalized preview; fix all row errors. Explicitly review item types, UOM, leading-zero phones, rates and GST.
4. Confirm the preview, commit, then reload Business Desk and compare the batch count and sample records. The batch history records who imported it.
5. Reconcile stock and financial opening balances separately in a rehearsal environment before live cutover. Freeze the old writer, agree a cutoff and test restore. Do not let both applications independently own the same invoice or stock movement.

Troubleshooting: duplicate headers must be renamed; unequal row widths usually indicate delimiter/quoting errors; existing identity conflicts require manual reconciliation, not a new request key. A preview can pass and commit still conflict if another operator creates the same record in the meantime. Retry a network failure with the unchanged payload/key and inspect history before making a new batch.

## API manager and webhook manager (pending)

Target management screens: scoped credentials, endpoint ownership, subscribed event types, delivery attempts, next retry, response summary, dead-letter queue, secret rotation, pause/resume and test delivery. Never display saved secrets after creation or store them in URL query strings. Current staff API authentication is not a scoped integration-key implementation.

Target event envelope:

```json
{
  "eventId": "stable-event-id",
  "schemaVersion": 1,
  "companyId": "provider-issued-company-id",
  "type": "invoice.posted",
  "occurredAt": "2026-10-10T12:00:00Z",
  "source": "evergreen",
  "aggregateId": "invoice-id",
  "aggregateVersion": 1,
  "data": {}
}
```

Implementation contract: transactional outbox committed with the business mutation; worker sends after commit; delivery is at least once; receiving inbox deduplicates company+connector+event ID; retain original event ID through retries. Sign timestamp plus raw body with HMAC, check replay window and constant-time signature equality, rotate secrets with overlap. Use HTTPS, bounded payloads/timeouts, destination validation against private-network/metadata access and redirect/DNS revalidation. Retry transient failures with bounded exponential backoff/jitter; stop permanent failures for operator review. Never claim exactly-once network delivery.

Resolve conflicts through an explicit source-of-truth policy per entity. Preserve source IDs, versions and correlation IDs. Do not use last-write-wins for posted invoices, payments or stock; use reviewed corrective documents. For a PC behind NAT, a local bridge makes outbound authenticated requests and stores a durable queue. A cloud webhook cannot directly reach an arbitrary offline PC.

## TallyPrime and print compatibility (pending)

TallyPrime supports XML over HTTP; the default configured port is 9000 and the company must be open. A local bridge can translate reviewed EverGreen parties/items/vouchers and inspect Tally's import response. Keep Tally on the local network and use an outbound bridge to cloud services. Confirm the target Tally release and schema before selecting XML or another supported interface. [Official XML integration](https://help.tallysolutions.com/xml-integration/), [integration prerequisites](https://help.tallysolutions.com/pre-requisites-for-integrations/).

Map company identity, ledger names, units, tax ledgers, voucher type/number/date, debit/credit, rounding and cancellation semantics. Keep source references and external acknowledgement IDs; reconcile totals and retry without duplicate vouchers. Tally-compatible printing is separate: agree a template, retain issuer snapshots and compare printed quantities/tax/totals against the saved invoice. There is currently no tested Tally connector, TDL plugin or Tally-branded print certification.

## e-Way Bill (pending)

Registration uses the official authenticated API workflow; API credentials are obtained through the applicable direct/GSP registration route. Store credentials server-side, test generation/query/error handling in the provider sandbox, persist acknowledgements and reconcile status after timeouts before retrying. A printable invoice or a checksum is not an e-Way Bill or e-invoice registration. [Official overview](https://docs.ewaybillgst.gov.in/apidocs/api-overview.html), [authentication](https://docs.ewaybillgst.gov.in/apidocs/version1.01/authentication.html).

The referenced provider documentation was checked on 2026-10-10. Eligibility, current schemas, provider access and customer-specific statutory requirements must be checked when implementing the connector. No live statutory submission was made.
