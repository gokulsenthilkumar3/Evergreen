# Costing

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Costing.tsx](../../../apps/web/src/pages/Costing.tsx).

Direct routes: `/costing`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Dashboard ([apps/web/src/pages/Costing.tsx:274](../../../apps/web/src/pages/Costing.tsx))
- EB (Electricity) ([apps/web/src/pages/Costing.tsx:275](../../../apps/web/src/pages/Costing.tsx))
- Employee ([apps/web/src/pages/Costing.tsx:276](../../../apps/web/src/pages/Costing.tsx))
- Packaging ([apps/web/src/pages/Costing.tsx:277](../../../apps/web/src/pages/Costing.tsx))
- Maintenance ([apps/web/src/pages/Costing.tsx:278](../../../apps/web/src/pages/Costing.tsx))
- Expenses ([apps/web/src/pages/Costing.tsx:279](../../../apps/web/src/pages/Costing.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Add Cost | `{() => { setOpenWizard(true); }}` | [apps/web/src/pages/Costing.tsx:260](../../../apps/web/src/pages/Costing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteEntry(entry.id)}` | [apps/web/src/pages/Costing.tsx:458](../../../apps/web/src/pages/Costing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteEntry(entry.id)}` | [apps/web/src/pages/Costing.tsx:487](../../../apps/web/src/pages/Costing.tsx) |
| <CloseIcon /> | `{() => setOpenWizard(false)}` | [apps/web/src/pages/Costing.tsx:524](../../../apps/web/src/pages/Costing.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/costing/entries` | [apps/web/src/pages/Costing.tsx:89](../../../apps/web/src/pages/Costing.tsx) |
| GET | `/production` | [apps/web/src/pages/Costing.tsx:103](../../../apps/web/src/pages/Costing.tsx) |
| DELETE | `'/costing/${id}'` | [apps/web/src/pages/Costing.tsx:206](../../../apps/web/src/pages/Costing.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [CostingEntry.tsx](../../../apps/web/src/pages/CostingEntry.tsx)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
