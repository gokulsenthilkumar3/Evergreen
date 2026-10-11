# Insights

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Insights.tsx](../../../apps/web/src/pages/Insights.tsx).

Direct routes: `/insights`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {t.label} ([apps/web/src/pages/Insights.tsx:275](../../../apps/web/src/pages/Insights.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Export All | `{() => alert('All reports exported successfully!')}` | [apps/web/src/pages/Insights.tsx:81](../../../apps/web/src/pages/Insights.tsx) |
| Generate Reports → | `{() => alert('${cat.category} reports generated successfully!')}` | [apps/web/src/pages/Insights.tsx:109](../../../apps/web/src/pages/Insights.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/billing/invoices` | [apps/web/src/pages/Insights.tsx:124](../../../apps/web/src/pages/Insights.tsx) |
| GET | `/dashboard/summary` | [apps/web/src/pages/Insights.tsx:130](../../../apps/web/src/pages/Insights.tsx) |
| GET | `/dashboard/charts` | [apps/web/src/pages/Insights.tsx:136](../../../apps/web/src/pages/Insights.tsx) |

## Composed behavior

- [EwayBills.tsx](../../../apps/web/src/components/insights/EwayBills.tsx)
- [TallySync.tsx](../../../apps/web/src/components/insights/TallySync.tsx)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
