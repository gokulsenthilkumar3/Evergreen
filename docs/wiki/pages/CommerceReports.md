# CommerceReports

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CommerceReports.tsx](../../../apps/web/src/pages/CommerceReports.tsx).

Direct routes: `/reports`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {`Outstanding Receivables (${debtorCustomers.length})`} ([apps/web/src/pages/CommerceReports.tsx:295](../../../apps/web/src/pages/CommerceReports.tsx))
- {`Low Stock Watchlist (${reportData?.lowStock?.length || 0})`} ([apps/web/src/pages/CommerceReports.tsx:300](../../../apps/web/src/pages/CommerceReports.tsx))
- {`Recent Invoices (${invoices.length})`} ([apps/web/src/pages/CommerceReports.tsx:305](../../../apps/web/src/pages/CommerceReports.tsx))
- {`Sales Orders (${orders.length})`} ([apps/web/src/pages/CommerceReports.tsx:310](../../../apps/web/src/pages/CommerceReports.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{handleRefresh}` | [apps/web/src/pages/CommerceReports.tsx:203](../../../apps/web/src/pages/CommerceReports.tsx) |
| Print Report | `{handlePrint}` | [apps/web/src/pages/CommerceReports.tsx:211](../../../apps/web/src/pages/CommerceReports.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/report` | [apps/web/src/pages/CommerceReports.tsx:61](../../../apps/web/src/pages/CommerceReports.tsx) |
| GET | `/commerce/invoices` | [apps/web/src/pages/CommerceReports.tsx:66](../../../apps/web/src/pages/CommerceReports.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/CommerceReports.tsx:71](../../../apps/web/src/pages/CommerceReports.tsx) |
| GET | `/commerce/orders` | [apps/web/src/pages/CommerceReports.tsx:76](../../../apps/web/src/pages/CommerceReports.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
