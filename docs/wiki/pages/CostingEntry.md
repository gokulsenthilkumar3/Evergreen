# CostingEntry

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CostingEntry.tsx](../../../apps/web/src/pages/CostingEntry.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiText("EB (Electricity)", 'tabs')} ([apps/web/src/pages/CostingEntry.tsx:396](../../../apps/web/src/pages/CostingEntry.tsx))
- {uiText("Employee Costs", 'tabs')} ([apps/web/src/pages/CostingEntry.tsx:397](../../../apps/web/src/pages/CostingEntry.tsx))
- {uiText("Packaging", 'tabs')} ([apps/web/src/pages/CostingEntry.tsx:398](../../../apps/web/src/pages/CostingEntry.tsx))
- {uiText("Maintenance", 'tabs')} ([apps/web/src/pages/CostingEntry.tsx:399](../../../apps/web/src/pages/CostingEntry.tsx))
- {uiText("Expenses", 'tabs')} ([apps/web/src/pages/CostingEntry.tsx:400](../../../apps/web/src/pages/CostingEntry.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {existingEB ? uiText(existingEB.posted ? 'Posted' : 'Update', 'forms') : uiText("Save")} | `{handleEBSubmit}` | [apps/web/src/pages/CostingEntry.tsx:429](../../../apps/web/src/pages/CostingEntry.tsx) |
| {existingEmployee ? uiText(existingEmployee.posted ? 'Posted' : 'Update', 'forms') : uiText("Save")} | `{handleEmployeeSubmit}` | [apps/web/src/pages/CostingEntry.tsx:456](../../../apps/web/src/pages/CostingEntry.tsx) |
| {existingPackaging ? uiText(existingPackaging.posted ? 'Posted' : 'Update', 'forms') : uiText("Confirm")} | `{handlePackagingSubmit}` | [apps/web/src/pages/CostingEntry.tsx:498](../../../apps/web/src/pages/CostingEntry.tsx) |
| {uiText("Apply Formula")} | `{() => setMaintenanceData({ ...maintenanceData, totalCost: maintenanceFormulaCost.toFixed(2) })}` | [apps/web/src/pages/CostingEntry.tsx:537](../../../apps/web/src/pages/CostingEntry.tsx) |
| {existingMaintenance ? uiText(existingMaintenance.posted ? 'Posted' : 'Update', 'forms') : uiText("Save")} | `{handleMaintenanceSubmit}` | [apps/web/src/pages/CostingEntry.tsx:540](../../../apps/web/src/pages/CostingEntry.tsx) |
| {uiText("Save Expense")} | `{handleExpenseSubmit}` | [apps/web/src/pages/CostingEntry.tsx:555](../../../apps/web/src/pages/CostingEntry.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/production` | [apps/web/src/pages/CostingEntry.tsx:87](../../../apps/web/src/pages/CostingEntry.tsx) |
| GET | `/costing/entries` | [apps/web/src/pages/CostingEntry.tsx:142](../../../apps/web/src/pages/CostingEntry.tsx) |
| GET | `/settings` | [apps/web/src/pages/CostingEntry.tsx:156](../../../apps/web/src/pages/CostingEntry.tsx) |
| DELETE | `'/costing/${id}'` | [apps/web/src/pages/CostingEntry.tsx:242](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingEB.id}'` | [apps/web/src/pages/CostingEntry.tsx:275](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/eb` | [apps/web/src/pages/CostingEntry.tsx:276](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingEmployee.id}'` | [apps/web/src/pages/CostingEntry.tsx:298](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/employee` | [apps/web/src/pages/CostingEntry.tsx:299](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingPackaging.id}'` | [apps/web/src/pages/CostingEntry.tsx:321](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/packaging` | [apps/web/src/pages/CostingEntry.tsx:322](../../../apps/web/src/pages/CostingEntry.tsx) |
| PUT | `'/costing/${existingMaintenance.id}'` | [apps/web/src/pages/CostingEntry.tsx:344](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/maintenance` | [apps/web/src/pages/CostingEntry.tsx:345](../../../apps/web/src/pages/CostingEntry.tsx) |
| POST | `/costing/expense` | [apps/web/src/pages/CostingEntry.tsx:364](../../../apps/web/src/pages/CostingEntry.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [costingPayloads.ts](../../../apps/web/src/utils/costingPayloads.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
