# CostingList

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CostingList.tsx](../../../apps/web/src/pages/CostingList.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- EB (Electricity) ([apps/web/src/pages/CostingList.tsx:69](../../../apps/web/src/pages/CostingList.tsx))
- Employee ([apps/web/src/pages/CostingList.tsx:70](../../../apps/web/src/pages/CostingList.tsx))
- Packaging ([apps/web/src/pages/CostingList.tsx:71](../../../apps/web/src/pages/CostingList.tsx))
- Maintenance ([apps/web/src/pages/CostingList.tsx:72](../../../apps/web/src/pages/CostingList.tsx))
- Expenses ([apps/web/src/pages/CostingList.tsx:73](../../../apps/web/src/pages/CostingList.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/costing/entries` | [apps/web/src/pages/CostingList.tsx:41](../../../apps/web/src/pages/CostingList.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
