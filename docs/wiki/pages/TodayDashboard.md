# TodayDashboard

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/TodayDashboard.tsx](../../../apps/web/src/pages/TodayDashboard.tsx).

Direct routes: `/today`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| <RefreshIcon /> | `{handleRefresh}` | [apps/web/src/pages/TodayDashboard.tsx:153](../../../apps/web/src/pages/TodayDashboard.tsx) |
| Record Production | `{() => navigate('production')}` | [apps/web/src/pages/TodayDashboard.tsx:254](../../../apps/web/src/pages/TodayDashboard.tsx) |
| Add Costs | `{() => navigate('costing')}` | [apps/web/src/pages/TodayDashboard.tsx:263](../../../apps/web/src/pages/TodayDashboard.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/production` | [apps/web/src/pages/TodayDashboard.tsx:71](../../../apps/web/src/pages/TodayDashboard.tsx) |
| GET | `/costing/entries` | [apps/web/src/pages/TodayDashboard.tsx:80](../../../apps/web/src/pages/TodayDashboard.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
