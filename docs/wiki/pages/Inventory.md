# Inventory

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Inventory.tsx](../../../apps/web/src/pages/Inventory.tsx).

Direct routes: `/inventory`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiText("Dashboard", 'tabs')} ([apps/web/src/pages/Inventory.tsx:496](../../../apps/web/src/pages/Inventory.tsx))
- {uiText("Cotton Inventory", 'tabs')} ([apps/web/src/pages/Inventory.tsx:497](../../../apps/web/src/pages/Inventory.tsx))
- {uiText("Yarn Inventory", 'tabs')} ([apps/web/src/pages/Inventory.tsx:498](../../../apps/web/src/pages/Inventory.tsx))
- {uiText("Waste Logs", 'tabs')} ([apps/web/src/pages/Inventory.tsx:499](../../../apps/web/src/pages/Inventory.tsx))
- {uiText("All History", 'tabs')} ([apps/web/src/pages/Inventory.tsx:500](../../../apps/web/src/pages/Inventory.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Manage Waste stock ")} | `{() => { setWasteForm({ date: dateKey(), quantity: '', buyer: '', price: '' }); setWasteAction('recycle'); setWasteModalOpen(true); }}` | [apps/web/src/pages/Inventory.tsx:618](../../../apps/web/src/pages/Inventory.tsx) |
| <EditIcon fontSize="small" /> | `{() => { setWasteAction(row.type === 'EXPORT' ? 'export' : 'recycle'); setWasteForm({ date: dateKey(row.date), quantity: Math.abs(row.quantity).toString(), buyer: row.reference.startsWith('SOLD-') ? row.reference.replace('SOLD-', '') : '', price: '' // Price is not stored in inventory log currently }); // Since we don't have PUT, we'll suggest deleting and re-adding toast.info(INFO_MESSAGES.EDIT_WORKFLOW_DELETE_CREATE); setWasteModalOpen(true); // We could set editingWasteId here if we wanted to handle it in submit }}` | [apps/web/src/pages/Inventory.tsx:700](../../../apps/web/src/pages/Inventory.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteWaste(row.id)}` | [apps/web/src/pages/Inventory.tsx:720](../../../apps/web/src/pages/Inventory.tsx) |
| {uiText("Cancel")} | `{() => setWasteModalOpen(false)}` | [apps/web/src/pages/Inventory.tsx:896](../../../apps/web/src/pages/Inventory.tsx) |
| {uiText("Submit ")} | `{handleWasteSubmit}` | [apps/web/src/pages/Inventory.tsx:897](../../../apps/web/src/pages/Inventory.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| DELETE | `'/inventory/waste/${id}'` | [apps/web/src/pages/Inventory.tsx:171](../../../apps/web/src/pages/Inventory.tsx) |
| POST | `/inventory/waste/export` | [apps/web/src/pages/Inventory.tsx:190](../../../apps/web/src/pages/Inventory.tsx) |
| POST | `/inventory/waste/recycle` | [apps/web/src/pages/Inventory.tsx:192](../../../apps/web/src/pages/Inventory.tsx) |
| GET | `/inventory/history` | [apps/web/src/pages/Inventory.tsx:214](../../../apps/web/src/pages/Inventory.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
- [excelGenerator.ts](../../../apps/web/src/utils/excelGenerator.ts)
- [pdfGenerator.ts](../../../apps/web/src/utils/pdfGenerator.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [deleteGuardHandler.ts](../../../apps/web/src/utils/deleteGuardHandler.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)
- [ExportButtons.tsx](../../../apps/web/src/components/common/ExportButtons.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
