# Integrations — import and connector guide

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md) · [Integration contracts](../../INTEGRATIONS.md)

Reviewed against the source on 2026-10-18. This is a maintained operating guide; `docs:generate` deliberately preserves it.

Source: [Integrations.tsx](../../../apps/web/src/pages/Integrations.tsx), [API service](../../../apps/api/src/modules/integrations/integrations.service.ts) and [shared import rules](../../../packages/types/migration.ts).

Route: `/integrations`. Import preview, commit and history require the customer installation's **ADMIN** role.

## What is available

| Tab | Current behavior |
| --- | --- |
| Import data | Preview and import customer or catalogue master records from CSV |
| Connectors | Describes pending TallyPrime, e-Way Bill and existing-software connectors; no configuration or execution controls |
| API & webhooks | Explains staff bearer access and import endpoints; scoped keys, subscriptions and delivery queues are pending |
| Import history | Lists the latest 50 committed batches and offers Retry when history loading fails |

The [commercial plans](../../COMMERCIAL_MODEL.md#proposed-catalogue-prices-require-commercial-validation) are proposals. A plan name does not enable a connector. Tally Sales/Receipt XML export exists separately, with [known gaps](../../INTEGRATIONS.md#export-implemented-with-known-gaps); importing a CSV here does not send anything to Tally.

## Import customer or catalogue records

1. Sign in as a company administrator and choose **Import data**.
2. Select **Customers** or **Catalogue items**, then enter a source name of at most 200 characters. Keep that name when retrying the same batch.
3. Choose a UTF-8 CSV file of at most 500,000 bytes, with 1–500 data records and 1–50 distinct, nonempty headers.
4. Map each supported field to its original column. Each source column can map to at most one field. Unmapped columns are ignored.
5. Click **Validate and preview**. Resolve every reported error and review the first five normalized records and ignored columns.
6. Select the confirmation checkbox and click **Import N records**. A successful response shows the batch ID and whether it was already imported.
7. Check Import history and reload the owning customer or catalogue screen to confirm the records.

CSV permits a UTF-8 BOM, quoted commas, embedded line breaks and doubled quotes. Rows must have the same width as the header; cells are limited to 2,000 characters. Editing the file, mapping, entity or source invalidates the preview and confirmation.

| Entity | Required fields | Optional fields |
| --- | --- | --- |
| Customers | `name` | `phone`, `email`, `gstin`, `state`, `address` |
| Catalogue items | `sku`, `name`, `type`, `uom` | `hsnSac`, `gstRate`, `salePrice` |

Supported item types are `RAW_MATERIAL`, `YARN`, `FINISHED_GOOD`, `JOB_WORK_MATERIAL` and `SERVICE`. Missing optional numeric fields default to zero. Review those defaults before accepting the import. Format checks do not verify a party's identity or tax registration.

Existing catalogue SKUs and case-insensitive customer names cause a conflict. The importer does not overwrite or merge existing records. Resolve identity conflicts against the existing master record; renaming a duplicate party can create a second account for the same business.

## Retry and reconciliation

The UI creates a request key and retains it while retrying an unchanged submission. The service revalidates before commit and creates the records plus import batch atomically. The same key and normalized payload return the existing result; a changed payload under that key conflicts. A fingerprint also prevents replay of the same source, entity and normalized records under a new key.

After an uncertain response, check history and retry the unchanged batch. Changing the source or records starts a different import attempt and must not be used to bypass duplicate detection.

Only master records are imported. Opening stock, invoices, payments, historical balances and stock lots require a separate reconciled migration through the owning business commands. The importer does not create their stock or accounting effects.

## Import history

Each visible history card shows the batch ID, source, row count, entity and import time formatted for the browser's locale. The API also stores the authenticated actor; the current card does not display that actor. History is company-wide, not filtered to the current administrator. Rejected or uncommitted attempts do not create successful batch entries.

Loading, empty and failed states are explicit. **Retry** reloads a failed history request; it does not repeat the import.

## Pending connectors and keys

Direct connectors, historical-invoice import, automatic e-Way Bill registration, webhook delivery and scoped integration-key management are not implemented by this page. There are no credential-entry or webhook-registration controls to configure today. The source screen labels these features pending.

Use exported customer and item CSV files for supported imports. Connector design and future delivery requirements belong in the [integration contracts](../../INTEGRATIONS.md), including acknowledgements, retry handling and reconciliation. Staff bearer access remains subject to API permissions and is not a permanent connector credential.

## API endpoints

Paths below are relative to the browser API base, `/api/backend` by default.

| Method | Path | Role | Behavior |
| --- | --- | --- | --- |
| GET | `/integrations/imports` | ADMIN | Latest 50 committed batches |
| POST | `/integrations/imports/preview` | ADMIN | Validate and normalize; no persistence |
| POST | `/integrations/imports/commit` | ADMIN | Revalidate, import atomically and handle replays |

## Troubleshooting

| Problem | Next action |
| --- | --- |
| Existing SKU or customer name | Compare with the existing master record and resolve the conflict before importing |
| Preview errors | Fix the source or mapping, validate again and review the new preview |
| Request key used for different data | Check the previous batch first; start a new reviewed import only for genuinely new records |
| Uncertain commit response | Check history and retry the unchanged submission |
| History failed to load | Use Retry; do not infer that the import failed |
| Opening balance or invoice missing | These are outside master-data import; follow the reconciled business migration plan |

## Related documentation

- [Architecture — integrations and adjacent apps](../../ARCHITECTURE.md#integrations-and-adjacent-apps)
- [Business flow](../../BUSINESS_FLOW.md)
- [Integration contracts](../../INTEGRATIONS.md)
- [API reference](../../reference/API.md) and [UI controls](../../reference/UI_CONTROLS.md)
