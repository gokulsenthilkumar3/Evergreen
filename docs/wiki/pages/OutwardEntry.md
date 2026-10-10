# OutwardEntry

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/OutwardEntry.tsx](../../../apps/web/src/pages/OutwardEntry.tsx).

Direct routes: `/outward`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Add Outward | `{() => { setDispatchTime(localTimeValue()); setOpenDialog(true); }}` | [apps/web/src/pages/OutwardEntry.tsx:349](../../../apps/web/src/pages/OutwardEntry.tsx) |
| Generate QR and Barcode Label | `{() => setLabelOutward(row)}` | [apps/web/src/pages/OutwardEntry.tsx:398](../../../apps/web/src/pages/OutwardEntry.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteOutward(row.id)}` | [apps/web/src/pages/OutwardEntry.tsx:409](../../../apps/web/src/pages/OutwardEntry.tsx) |
| Remove dispatch row | `{() => removeItemRow(item.id)}` | [apps/web/src/pages/OutwardEntry.tsx:559](../../../apps/web/src/pages/OutwardEntry.tsx) |
| Add Row | `{addItemRow}` | [apps/web/src/pages/OutwardEntry.tsx:570](../../../apps/web/src/pages/OutwardEntry.tsx) |
| Cancel | `{() => { setOpenDialog(false); setShowErrors(false); }}` | [apps/web/src/pages/OutwardEntry.tsx:588](../../../apps/web/src/pages/OutwardEntry.tsx) |
| {isSubmitting ? 'Saving...' : 'Save Entry'} | `{handleSave}` | [apps/web/src/pages/OutwardEntry.tsx:589](../../../apps/web/src/pages/OutwardEntry.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/inventory/outward` | [apps/web/src/pages/OutwardEntry.tsx:112](../../../apps/web/src/pages/OutwardEntry.tsx) |
| GET | `/inventory/yarn-stock` | [apps/web/src/pages/OutwardEntry.tsx:126](../../../apps/web/src/pages/OutwardEntry.tsx) |
| POST | `/inventory/outward` | [apps/web/src/pages/OutwardEntry.tsx:225](../../../apps/web/src/pages/OutwardEntry.tsx) |
| DELETE | `'/inventory/outward/${id}'` | [apps/web/src/pages/OutwardEntry.tsx:258](../../../apps/web/src/pages/OutwardEntry.tsx) |

## Composed behavior

- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)
- [validators.ts](../../../apps/web/src/utils/validators.ts)
- [BarcodeQRModal.tsx](../../../apps/web/src/components/common/BarcodeQRModal.tsx)
- [codeFormatters.ts](../../../apps/web/src/utils/codeFormatters.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [productionTiming.ts](../../../apps/web/src/utils/productionTiming.ts)
- [excelGenerator.ts](../../../apps/web/src/utils/excelGenerator.ts)
- [pdfGenerator.ts](../../../apps/web/src/utils/pdfGenerator.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [deleteGuardHandler.ts](../../../apps/web/src/utils/deleteGuardHandler.ts)
- [EmptyState.tsx](../../../apps/web/src/components/common/EmptyState.tsx)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)
- [ExportButtons.tsx](../../../apps/web/src/components/common/ExportButtons.tsx)
- [EntryWizardHeader.tsx](../../../apps/web/src/components/common/EntryWizardHeader.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
