# Costing

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Costing.tsx](../../../apps/web/src/pages/Costing.tsx).

Direct routes: `/costing`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiText("Dashboard", 'tabs')} ([apps/web/src/pages/Costing.tsx:276](../../../apps/web/src/pages/Costing.tsx))
- {uiText("EB (Electricity)", 'tabs')} ([apps/web/src/pages/Costing.tsx:277](../../../apps/web/src/pages/Costing.tsx))
- {uiText("Employee", 'tabs')} ([apps/web/src/pages/Costing.tsx:278](../../../apps/web/src/pages/Costing.tsx))
- {uiText("Packaging", 'tabs')} ([apps/web/src/pages/Costing.tsx:279](../../../apps/web/src/pages/Costing.tsx))
- {uiText("Maintenance", 'tabs')} ([apps/web/src/pages/Costing.tsx:280](../../../apps/web/src/pages/Costing.tsx))
- {uiText("Expenses", 'tabs')} ([apps/web/src/pages/Costing.tsx:281](../../../apps/web/src/pages/Costing.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Add Cost ")} | `{() => { setOpenWizard(true); }}` | [apps/web/src/pages/Costing.tsx:263](../../../apps/web/src/pages/Costing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteEntry(entry.id)}` | [apps/web/src/pages/Costing.tsx:460](../../../apps/web/src/pages/Costing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteEntry(entry.id)}` | [apps/web/src/pages/Costing.tsx:489](../../../apps/web/src/pages/Costing.tsx) |
| <CloseIcon /> | `{() => setOpenWizard(false)}` | [apps/web/src/pages/Costing.tsx:526](../../../apps/web/src/pages/Costing.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/costing/entries` | [apps/web/src/pages/Costing.tsx:93](../../../apps/web/src/pages/Costing.tsx) |
| GET | `/production` | [apps/web/src/pages/Costing.tsx:107](../../../apps/web/src/pages/Costing.tsx) |
| DELETE | `'/costing/${id}'` | [apps/web/src/pages/Costing.tsx:210](../../../apps/web/src/pages/Costing.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [CostingEntry.tsx](../../../apps/web/src/pages/CostingEntry.tsx)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
