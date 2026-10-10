# index

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/InvoiceGenerator/index.tsx](../../../apps/web/src/pages/InvoiceGenerator/index.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Details ([apps/web/src/pages/InvoiceGenerator/index.tsx:94](../../../apps/web/src/pages/InvoiceGenerator/index.tsx))
- Theme ([apps/web/src/pages/InvoiceGenerator/index.tsx:95](../../../apps/web/src/pages/InvoiceGenerator/index.tsx))
- Suggestions ([apps/web/src/pages/InvoiceGenerator/index.tsx:96](../../../apps/web/src/pages/InvoiceGenerator/index.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| <CloseIcon sx={{ fontSize: 12 }} /> | `{onRemove}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:42](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| {label} | `{() => inputRef.current?.click()}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:49](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| {t.name} | `{() => store.setField('theme', t.id)}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:140](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| Reset Invoice | `{store.resetInvoice}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:164](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| Open Invoice Studio to finalise | `{() => onNavigate?.('invoicestudio')}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:168](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| {exporting ? 'Generating PDF\u2026' : 'Export PDF'} | `{handleExport}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:171](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| <DeleteIcon sx={{ fontSize: 15 }} /> | `{() => store.removeItem(item.id)}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:219](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |
| Add Line Item | `{store.addItem}` | [apps/web/src/pages/InvoiceGenerator/index.tsx:222](../../../apps/web/src/pages/InvoiceGenerator/index.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |

## Composed behavior

- [store.ts](../../../apps/web/src/pages/InvoiceGenerator/store.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
