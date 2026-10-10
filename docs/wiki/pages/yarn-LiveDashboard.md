# LiveDashboard

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/LiveDashboard.tsx](../../../apps/web/src/pages/yarn/LiveDashboard.tsx).

Direct routes: `/yarnlive`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{handleRefresh}` | [apps/web/src/pages/yarn/LiveDashboard.tsx:83](../../../apps/web/src/pages/yarn/LiveDashboard.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/machines` | [apps/web/src/pages/yarn/LiveDashboard.tsx:51](../../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| GET | `/machines/inspections` | [apps/web/src/pages/yarn/LiveDashboard.tsx:57](../../../apps/web/src/pages/yarn/LiveDashboard.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
