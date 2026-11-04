# CommerceReports

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CommerceReports.tsx](../../../apps/web/src/pages/CommerceReports.tsx).

Direct routes: `/reports`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiScopedTemplate('tabs')`Outstanding Receivables (${debtorCustomers.length})`} ([apps/web/src/pages/CommerceReports.tsx:293](../../../apps/web/src/pages/CommerceReports.tsx))
- {uiScopedTemplate('tabs')`Low Stock Watchlist (${reportData?.lowStock?.length || 0})`} ([apps/web/src/pages/CommerceReports.tsx:298](../../../apps/web/src/pages/CommerceReports.tsx))
- {uiScopedTemplate('tabs')`Recent Invoices (${invoices.length})`} ([apps/web/src/pages/CommerceReports.tsx:303](../../../apps/web/src/pages/CommerceReports.tsx))
- {uiScopedTemplate('tabs')`Sales Orders (${orders.length})`} ([apps/web/src/pages/CommerceReports.tsx:308](../../../apps/web/src/pages/CommerceReports.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Refresh ")} | `{handleRefresh}` | [apps/web/src/pages/CommerceReports.tsx:203](../../../apps/web/src/pages/CommerceReports.tsx) |
| {uiText("Print Report ")} | `{handlePrint}` | [apps/web/src/pages/CommerceReports.tsx:210](../../../apps/web/src/pages/CommerceReports.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/report` | [apps/web/src/pages/CommerceReports.tsx:63](../../../apps/web/src/pages/CommerceReports.tsx) |
| GET | `/commerce/invoices` | [apps/web/src/pages/CommerceReports.tsx:68](../../../apps/web/src/pages/CommerceReports.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/CommerceReports.tsx:73](../../../apps/web/src/pages/CommerceReports.tsx) |
| GET | `/commerce/orders` | [apps/web/src/pages/CommerceReports.tsx:78](../../../apps/web/src/pages/CommerceReports.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
