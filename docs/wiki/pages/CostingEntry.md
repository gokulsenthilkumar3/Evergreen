# CostingEntry

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CostingEntry.tsx](../../../apps/web/src/pages/CostingEntry.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- EB (Electricity) ([apps/web/src/pages/CostingEntry.tsx:380](../../../apps/web/src/pages/CostingEntry.tsx))
- Employee Costs ([apps/web/src/pages/CostingEntry.tsx:381](../../../apps/web/src/pages/CostingEntry.tsx))
- Packaging ([apps/web/src/pages/CostingEntry.tsx:382](../../../apps/web/src/pages/CostingEntry.tsx))
- Maintenance ([apps/web/src/pages/CostingEntry.tsx:383](../../../apps/web/src/pages/CostingEntry.tsx))
- Expenses ([apps/web/src/pages/CostingEntry.tsx:384](../../../apps/web/src/pages/CostingEntry.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {existingEB ? (existingEB.posted ? 'Posted' : 'Update') : 'Save'} | `{handleEBSubmit}` | [apps/web/src/pages/CostingEntry.tsx:413](../../../apps/web/src/pages/CostingEntry.tsx) |
| {existingEmployee ? (existingEmployee.posted ? 'Posted' : 'Update') : 'Save'} | `{handleEmployeeSubmit}` | [apps/web/src/pages/CostingEntry.tsx:440](../../../apps/web/src/pages/CostingEntry.tsx) |
| {existingPackaging ? (existingPackaging.posted ? 'Posted' : 'Update') : 'Confirm'} | `{handlePackagingSubmit}` | [apps/web/src/pages/CostingEntry.tsx:483](../../../apps/web/src/pages/CostingEntry.tsx) |
| Apply Formula | `{() => setMaintenanceData({ ...maintenanceData, totalCost: maintenanceFormulaCost.toFixed(2) })}` | [apps/web/src/pages/CostingEntry.tsx:523](../../../apps/web/src/pages/CostingEntry.tsx) |
| {existingMaintenance ? (existingMaintenance.posted ? 'Posted' : 'Update') : 'Save'} | `{handleMaintenanceSubmit}` | [apps/web/src/pages/CostingEntry.tsx:526](../../../apps/web/src/pages/CostingEntry.tsx) |
| Save Expense | `{handleExpenseSubmit}` | [apps/web/src/pages/CostingEntry.tsx:541](../../../apps/web/src/pages/CostingEntry.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/production` | [apps/web/src/pages/CostingEntry.tsx:83](../../../apps/web/src/pages/CostingEntry.tsx) |
| GET | `/costing/entries` | [apps/web/src/pages/CostingEntry.tsx:138](../../../apps/web/src/pages/CostingEntry.tsx) |
| GET | `/settings` | [apps/web/src/pages/CostingEntry.tsx:152](../../../apps/web/src/pages/CostingEntry.tsx) |
| DELETE | `'/costing/${id}'` | [apps/web/src/pages/CostingEntry.tsx:238](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingEB.id}'` | [apps/web/src/pages/CostingEntry.tsx:259](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/eb` | [apps/web/src/pages/CostingEntry.tsx:260](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingEmployee.id}'` | [apps/web/src/pages/CostingEntry.tsx:282](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/employee` | [apps/web/src/pages/CostingEntry.tsx:283](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingPackaging.id}'` | [apps/web/src/pages/CostingEntry.tsx:305](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/packaging` | [apps/web/src/pages/CostingEntry.tsx:306](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingMaintenance.id}'` | [apps/web/src/pages/CostingEntry.tsx:328](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/maintenance` | [apps/web/src/pages/CostingEntry.tsx:329](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/expense` | [apps/web/src/pages/CostingEntry.tsx:348](../../../apps/web/src/pages/CostingEntry.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [costingPayloads.ts](../../../apps/web/src/utils/costingPayloads.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
