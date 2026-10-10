# Integrations — Migration and Connectors

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md) · [Commercial model](../../COMMERCIAL_MODEL.md)

Source: [apps/web/src/pages/Integrations.tsx](../../../apps/web/src/pages/Integrations.tsx)  
API service: [apps/api/src/modules/integrations/](../../../apps/api/src/modules/integrations/)  
Type definitions: [packages/types/migration.ts](../../../packages/types/migration.ts)

Route: `/integrations` — requires **ADMIN** role.

---

## Overview

The Integrations page has four tabs:

| Tab | Purpose | Status |
|---|---|---|
| **Import Data** | Bring customer and catalogue master records from CSV/spreadsheet | Implemented |
| **Connectors** | Easy Bill, Tally Prime, and custom connector configuration | Planned — Grow/Scale plans |
| **API & Webhooks** | Inbound webhook registration; API key management | Planned — Grow/Scale plans |
| **Import History** | Audit log of all import batches | Implemented |

---

## Tab 1: Import Data

### What it does

Imports **customer master records** or **catalogue items** from a UTF-8 CSV file.
It does **not** import invoices, stock movements, payments, or opening balances.
Those require separate reconciliation using canonical business commands.

### Who can use it

ADMIN role only. The import is attributed to the authenticated user.

### Step-by-step flow

1. Select the entity type: **Customers** or **Catalogue items**
2. Enter a **source name** (e.g., "Old customer register 2024") — keep the same name when retrying
3. Click **Choose CSV** and select a UTF-8 CSV file (max 500 KB, max 500 rows)
4. Map your CSV column headers to EverGreen fields using the dropdown selectors
5. Click **Validate and preview** — review any row errors in the preview
6. Fix errors and re-upload if needed; check the first 5 normalized records
7. Tick the confirmation checkbox
8. Click **Import N records**

### CSV format rules

| Rule | Detail |
|---|---|
| Encoding | UTF-8 (with or without BOM) |
| Delimiter | Comma |
| Quoting | RFC 4180 — fields with commas or line breaks must be quoted |
| Max file size | 500 KB |
| Max rows | 500 per batch |
| Row consistency | All rows must have the same number of columns as the header |
| Max cell length | 2,000 characters |
| Blank rows | Trailing blank rows are ignored |

### Customer fields

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Case-insensitive uniqueness check; ambiguous same-name parties require manual reconciliation |
| `phone` | No | Leading zeros are preserved as strings |
| `email` | No | Validation only — not a statutory verification |
| `gstin` | No | Format checked — not verified with GST portal |
| `state` | No | Defaults to blank; not invented |
| `address` | No | Free text |

### Catalogue item fields

| Field | Required | Notes |
|---|---|---|
| `sku` | Yes | Must be globally unique across the company catalogue |
| `name` | Yes | |
| `type` | Yes | Must be one of: `RAW_MATERIAL`, `YARN`, `FINISHED_GOOD`, `JOB_WORK_MATERIAL`, `SERVICE` |
| `uom` | Yes | Unit of measure (e.g., `KG`, `PCS`, `MTR`) |
| `hsnSac` | No | HSN/SAC code |
| `gstRate` | No | Defaults to 0 |
| `salePrice` | No | Defaults to 0 |

### Idempotency (retry safety)

Each import uses a `requestKey` (UUID generated automatically by the UI). If you retry the same file with the same source name:
- **Same data**: returns the existing import batch record (safe retry)
- **Different data with same key**: returns a conflict error — start a new import session
- **Same data, fingerprint match**: also returns the existing batch — no duplicate

### What is NOT imported

- Opening stock quantities
- Historical invoices or purchase orders
- Payments or outstanding balances
- Stock lots or batch assignments

These must be entered through the relevant operational screens (Inward Entry, Production, etc.).

---

## Tab 2: Connectors

> **Status: Planned** — available on Grow and Scale plans.

### Easy Bill Connector

Migrates data from Easy Bill (Busy/Vyapari/legacy billing software) into EverGreen.

| What migrates | How |
|---|---|
| Customer master | Mapped via Easy Bill CSV export → EverGreen customer import |
| Item/product catalogue | SKU, name, HSN, GST rate, sale price |
| Historical invoices | Imported as read-only reference documents (not operational records) |
| Opening balances | Must be reconciled manually in EverGreen |

**Migration steps:**
1. Export customers and items from Easy Bill as CSV
2. Use Tab 1 (Import Data) for customers and items
3. For historical invoices: use the Easy Bill connector once available
4. Enter opening stock via Inward Entry with source "Opening Balance YYYY"
5. Freeze writes in Easy Bill at the agreed cutoff date

### Tally Prime Connector

Bidirectional connector between Tally Prime and EverGreen.

| Direction | What syncs |
|---|---|
| Tally → EverGreen | Customer ledger, stock groups, items, opening balances |
| EverGreen → Tally | Sales vouchers, purchase vouchers (for statutory filing) |

**Coexistence model:** EverGreen handles day-to-day operations and inventory. Tally continues to be used for statutory compliance (GST filing, TDS, etc.). The connector pushes summarized voucher data to Tally; Tally does not write back to EverGreen stock.

**Tally XML API / TDL:** Uses the Tally Prime XML import/export interface. Company must have Tally Prime with XML API enabled.

### EWay Bill Connector

Generates GST e-Way Bills automatically on outward dispatch.

| Feature | Detail |
|---|---|
| Trigger | Outward Entry dispatch confirmation |
| API | NIC GST e-Way Bill API (sandbox + production modes) |
| Output | e-Way Bill number stamped on dispatch document and invoice PDF |
| Cancellation | Linked to EWay Bill cancellation API; triggered on outward reversal |

**Setup:** Enter NIC GST API credentials (GSTIN, username, password) in the connector settings. Test in sandbox mode before going live.

---

## Tab 3: API & Webhooks

> **Status: Planned** — available on Grow and Scale plans.

### Webhook Manager

Register external endpoints to receive EverGreen events in real-time.

| Setting | Description |
|---|---|
| Endpoint URL | HTTPS URL to receive POST requests |
| Event types | Select which events to subscribe to |
| Secret | HMAC-SHA256 signing secret for payload verification |
| Active / paused | Toggle delivery without deleting the registration |

### Supported event types (planned)

| Event | Trigger |
|---|---|
| `inward.created` | New inward receipt committed |
| `production.completed` | Production run posted |
| `outward.dispatched` | Outward dispatch confirmed |
| `invoice.created` | New invoice posted |
| `invoice.paid` | Payment recorded against invoice |
| `stock.low` | Stock falls below configured threshold |

### Webhook event envelope (target format)

```json
{
  "event": "invoice.created",
  "timestamp": "2026-10-10T15:30:00+05:30",
  "company": "evergreen-company-id",
  "data": { ... entity-specific payload ... },
  "signature": "sha256=<hmac>"
}
```

### API Key Manager

Allows creating scoped API keys for external integrations (point-of-sale, mobile app, third-party connector).

| Property | Description |
|---|---|
| Name | Human-readable label |
| Scopes | Selected set of API operations |
| Expiry | Required — no never-expiring keys |

Secrets are shown **once** at creation. They are stored as hashed values and cannot be retrieved later.

---

## Tab 4: Import History

Shows the last 50 import batches, newest first.

| Column | Description |
|---|---|
| ID | Immutable batch identifier |
| Source | The source name provided during import |
| Entity | `customers` or `items` |
| Row count | Number of records successfully imported |
| Imported at | UTC timestamp of the commit |
| Imported by | Username of the ADMIN who ran the import |

Use the **Retry** button to refresh the list. If an import is missing, check if it was committed by a different user, or if it was rejected (rejection is not recorded in history — only successful commits appear).

---

## API Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/integrations/imports` | ADMIN | Last 50 import batches |
| POST | `/integrations/imports/preview` | ADMIN | Validate and normalize rows; no persistence |
| POST | `/integrations/imports/commit` | ADMIN | Atomically import records with idempotency |

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "SKU already exists" | That SKU is already in the catalogue | Rename SKU in source file or skip it |
| "Customer already exists" | Same name (case-insensitive) already in database | Rename or merge manually |
| "Resolve every preview error" | Some rows have invalid data | Fix the errors shown in the preview section |
| "Request key was already used for different data" | Same request key reused with changed file | Reload the page to get a new request key |
| Blank rows in preview | Row has empty required fields | Check the CSV for blank rows or wrong delimiter |

---

## Related documentation

- [Architecture — Integrations](../../ARCHITECTURE.md#8-integrations-architecture)
- [Commercial model — Migration paths](../../COMMERCIAL_MODEL.md#9-migration-path-for-existing-users)
- [Business flow — Imports](../../BUSINESS_FLOW.md)
- [Integrations technical spec](../../INTEGRATIONS.md)


[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Integrations.tsx](../../../apps/web/src/pages/Integrations.tsx).

Direct routes: `/integrations`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Import data ([apps/web/src/pages/Integrations.tsx:48](../../../apps/web/src/pages/Integrations.tsx))
- Connectors ([apps/web/src/pages/Integrations.tsx:48](../../../apps/web/src/pages/Integrations.tsx))
- API & webhooks ([apps/web/src/pages/Integrations.tsx:48](../../../apps/web/src/pages/Integrations.tsx))
- Import history ([apps/web/src/pages/Integrations.tsx:48](../../../apps/web/src/pages/Integrations.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Choose CSV <input type="file" accept=".csv,text/csv" hidden onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; invalidatePreview(); setInput(null); try { if (file.size > 500_000) throw new Error('Use a CSV smaller than 500 KB.'); const parsed = parseImpo | `delegated / form submit` | [apps/web/src/pages/Integrations.tsx:56](../../../apps/web/src/pages/Integrations.tsx) |
| Validate and preview | `{check}` | [apps/web/src/pages/Integrations.tsx:72](../../../apps/web/src/pages/Integrations.tsx) |
| Import {preview.records.length} records | `{commit}` | [apps/web/src/pages/Integrations.tsx:80](../../../apps/web/src/pages/Integrations.tsx) |
| Retry | `{() => history.refetch()}` | [apps/web/src/pages/Integrations.tsx:99](../../../apps/web/src/pages/Integrations.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/integrations/imports` | [apps/web/src/pages/Integrations.tsx:19](../../../apps/web/src/pages/Integrations.tsx) |
| POST | `/integrations/imports/preview` | [apps/web/src/pages/Integrations.tsx:28](../../../apps/web/src/pages/Integrations.tsx) |
| POST | `/integrations/imports/commit` | [apps/web/src/pages/Integrations.tsx:36](../../../apps/web/src/pages/Integrations.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
