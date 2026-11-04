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
| {uiText("Refresh ")} | `{() => { queryClient.invalidateQueries({ queryKey: ['warehouse-locations'] }); queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] }); }}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:177](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {uiText("Add Location ")} | `{() => setOpenLocationDialog(true)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:188](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {uiText("Log Movement ")} | `{() => setOpenMovementDialog(true)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:195](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {uiText("Cancel ")} | `{() => setOpenLocationDialog(false)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:469](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {createLocationMutation.isPending ? uiText("Saving...") : uiText("Save Location")} | `{() => createLocationMutation.mutate(locationForm)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:471](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {uiText("Cancel ")} | `{() => setOpenMovementDialog(false)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:584](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| {createMovementMutation.isPending ? uiText("Logging...") : uiText("Save Movement")} | `{() => createMovementMutation.mutate(movementForm)}` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:586](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/warehouse/locations` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:92](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| GET | `/commerce/items` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:94](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| GET | `/warehouse/movements` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:103](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| POST | `/warehouse/locations` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:108](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| POST | `/warehouse/movements` | [apps/web/src/pages/yarn/WarehouseManagement.tsx:126](../../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
