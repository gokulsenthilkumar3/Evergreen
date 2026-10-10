# Dashboard

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Dashboard.tsx](../../../apps/web/src/pages/Dashboard.tsx).

Direct routes: `/dashboard`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {label} | `{onClick}` | [apps/web/src/pages/Dashboard.tsx:365](../../../apps/web/src/pages/Dashboard.tsx) |
| Record Production | `{() => navigate('production')}` | [apps/web/src/pages/Dashboard.tsx:412](../../../apps/web/src/pages/Dashboard.tsx) |
| Add Inward | `{() => navigate('inward')}` | [apps/web/src/pages/Dashboard.tsx:415](../../../apps/web/src/pages/Dashboard.tsx) |
| Record Production | `{() => navigate('production')}` | [apps/web/src/pages/Dashboard.tsx:470](../../../apps/web/src/pages/Dashboard.tsx) |
| Add Inward | `{() => navigate('inward')}` | [apps/web/src/pages/Dashboard.tsx:471](../../../apps/web/src/pages/Dashboard.tsx) |
| View Stock | `{() => navigate('inventory')}` | [apps/web/src/pages/Dashboard.tsx:472](../../../apps/web/src/pages/Dashboard.tsx) |
| Review Challans &amp; Generate Invoices | `{() => navigate('outward')}` | [apps/web/src/pages/Dashboard.tsx:510](../../../apps/web/src/pages/Dashboard.tsx) |
| View all logs | `{() => navigate('logs')}` | [apps/web/src/pages/Dashboard.tsx:901](../../../apps/web/src/pages/Dashboard.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `'/dashboard/summary?from=${dateRange.from}&to=${dateRange.to}'` | [apps/web/src/pages/Dashboard.tsx:255](../../../apps/web/src/pages/Dashboard.tsx) |
| GET | `'/dashboard/charts?from=${dateRange.from}&to=${dateRange.to}'` | [apps/web/src/pages/Dashboard.tsx:263](../../../apps/web/src/pages/Dashboard.tsx) |
| GET | `/dashboard/recent-activity` | [apps/web/src/pages/Dashboard.tsx:271](../../../apps/web/src/pages/Dashboard.tsx) |
| GET | `/commerce/un-invoiced-challans` | [apps/web/src/pages/Dashboard.tsx:281](../../../apps/web/src/pages/Dashboard.tsx) |
| GET | `/settings` | [apps/web/src/pages/Dashboard.tsx:292](../../../apps/web/src/pages/Dashboard.tsx) |

## Composed behavior

- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
