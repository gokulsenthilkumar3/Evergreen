# BookEllam

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/BookEllam.tsx](../../../apps/web/src/pages/BookEllam.tsx).

Direct routes: `/bookellam`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiScopedTemplate('tabs')`All Books (${allRecords.length})`} ([apps/web/src/pages/BookEllam.tsx:408](../../../apps/web/src/pages/BookEllam.tsx))
- {uiText("Inward Book (வரவு)", 'tabs')} ([apps/web/src/pages/BookEllam.tsx:409](../../../apps/web/src/pages/BookEllam.tsx))
- {uiText("Outward Book (செலவு)", 'tabs')} ([apps/web/src/pages/BookEllam.tsx:410](../../../apps/web/src/pages/BookEllam.tsx))
- {uiText("Stock & Waste (சரக்கு)", 'tabs')} ([apps/web/src/pages/BookEllam.tsx:411](../../../apps/web/src/pages/BookEllam.tsx))
- {uiText("Spinning Runs (உற்பத்தி)", 'tabs')} ([apps/web/src/pages/BookEllam.tsx:412](../../../apps/web/src/pages/BookEllam.tsx))
- {uiText("Party Ledger (பேரேடு / Khata)", 'tabs')} ([apps/web/src/pages/BookEllam.tsx:413](../../../apps/web/src/pages/BookEllam.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Export Sales / Receipts XML ")} | `{async () => { try { const response = await api.get('/integrations/tally/export', { params: { types: 'Sales,Receipt' }, responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = 'Tally-Sales-Receipts.xml'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch { toast.error(uiText('Tally export failed. An administrator account is required.', 'feedback')); } }}` | [apps/web/src/pages/BookEllam.tsx:271](../../../apps/web/src/pages/BookEllam.tsx) |
| {uiText("Export CSV Audit ")} | `{exportToCSV}` | [apps/web/src/pages/BookEllam.tsx:289](../../../apps/web/src/pages/BookEllam.tsx) |
| {uiText("Print Ledger Book ")} | `{() => window.print()}` | [apps/web/src/pages/BookEllam.tsx:298](../../../apps/web/src/pages/BookEllam.tsx) |
| {uiText("Clear Filters ")} | `{() => { setSearchQuery(''); setDateFilter(''); }}` | [apps/web/src/pages/BookEllam.tsx:390](../../../apps/web/src/pages/BookEllam.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/inventory/inward` | [apps/web/src/pages/BookEllam.tsx:62](../../../apps/web/src/pages/BookEllam.tsx) |
| GET | `/inventory/outward` | [apps/web/src/pages/BookEllam.tsx:71](../../../apps/web/src/pages/BookEllam.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/BookEllam.tsx:81](../../../apps/web/src/pages/BookEllam.tsx) |
| GET | `/production` | [apps/web/src/pages/BookEllam.tsx:94](../../../apps/web/src/pages/BookEllam.tsx) |
| GET | `/inventory/history?range=all` | [apps/web/src/pages/BookEllam.tsx:107](../../../apps/web/src/pages/BookEllam.tsx) |
| GET | `/integrations/tally/export` | [apps/web/src/pages/BookEllam.tsx:276](../../../apps/web/src/pages/BookEllam.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [csvGenerator.ts](../../../apps/web/src/utils/csvGenerator.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
