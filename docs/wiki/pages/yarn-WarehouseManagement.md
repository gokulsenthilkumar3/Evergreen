# WarehouseManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/WarehouseManagement.tsx](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx).

Direct routes: `/yarnwarehouse`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{() => { queryClient.invalidateQueries({ queryKey: ['warehouse-locations'] }); queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] }); }}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:177](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| Add Location | `{() => setOpenLocationDialog(true)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:189](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| Log Movement | `{() => setOpenMovementDialog(true)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:197](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| Cancel | `{() => setOpenLocationDialog(false)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:488](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {createLocationMutation.isPending ? 'Saving...' : 'Save Location'} | `{() => createLocationMutation.mutate(locationForm)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:491](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| Cancel | `{() => setOpenMovementDialog(false)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:605](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {createMovementMutation.isPending ? 'Logging...' : 'Save Movement'} | `{() => createMovementMutation.mutate(movementForm)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:608](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/warehouse/locations` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:90](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| GET | `/commerce/items` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:92](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| GET | `/warehouse/movements` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:101](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| POST | `/warehouse/locations` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:106](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| POST | `/warehouse/movements` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:124](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
