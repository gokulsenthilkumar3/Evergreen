# InwardEntry

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/InwardEntry.tsx](../../../apps/web/src/pages/InwardEntry.tsx).

Direct routes: `/inward`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Weighbridge receipt | `{() => setOpenWeighbridge(true)}` | [apps/web/src/pages/InwardEntry.tsx:353](../../../apps/web/src/pages/InwardEntry.tsx) |
| Merge ( {selectedBatches.length} ) | `{handleMergeBatches}` | [apps/web/src/pages/InwardEntry.tsx:355](../../../apps/web/src/pages/InwardEntry.tsx) |
| Add Batch | `{() => { setReceiptTime(localTimeValue()); setOpenWizard(true); }}` | [apps/web/src/pages/InwardEntry.tsx:366](../../../apps/web/src/pages/InwardEntry.tsx) |
| Cancel | `{() => { setOpenWizard(false); setTouched({}); }}` | [apps/web/src/pages/InwardEntry.tsx:494](../../../apps/web/src/pages/InwardEntry.tsx) |
| {isSubmitting ? 'Saving...' : 'Add Batch'} | `{handleSubmit}` | [apps/web/src/pages/InwardEntry.tsx:497](../../../apps/web/src/pages/InwardEntry.tsx) |
| <QrIcon fontSize="small" /> | `{() => setLabelBatch(row)}` | [apps/web/src/pages/InwardEntry.tsx:650](../../../apps/web/src/pages/InwardEntry.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteBatch(row.id)}` | [apps/web/src/pages/InwardEntry.tsx:656](../../../apps/web/src/pages/InwardEntry.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/inventory/inward` | [apps/web/src/pages/InwardEntry.tsx:124](../../../apps/web/src/pages/InwardEntry.tsx) |
| DELETE | `'/inventory/inward/${id}'` | [apps/web/src/pages/InwardEntry.tsx:185](../../../apps/web/src/pages/InwardEntry.tsx) |
| POST | `/inventory/inward` | [apps/web/src/pages/InwardEntry.tsx:203](../../../apps/web/src/pages/InwardEntry.tsx) |
| POST | `/inventory/inward/merge` | [apps/web/src/pages/InwardEntry.tsx:251](../../../apps/web/src/pages/InwardEntry.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [productionTiming.ts](../../../apps/web/src/utils/productionTiming.ts)
- [pdfGenerator.ts](../../../apps/web/src/utils/pdfGenerator.ts)
- [excelGenerator.ts](../../../apps/web/src/utils/excelGenerator.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [validators.ts](../../../apps/web/src/utils/validators.ts)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [deleteGuardHandler.ts](../../../apps/web/src/utils/deleteGuardHandler.ts)
- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)
- [EmptyState.tsx](../../../apps/web/src/components/common/EmptyState.tsx)
- [TableSkeleton.tsx](../../../apps/web/src/components/common/TableSkeleton.tsx)
- [RequiredLabel.tsx](../../../apps/web/src/components/common/RequiredLabel.tsx)
- [BarcodeQRModal.tsx](../../../apps/web/src/components/common/BarcodeQRModal.tsx)
- [codeFormatters.ts](../../../apps/web/src/utils/codeFormatters.ts)
- [ExportButtons.tsx](../../../apps/web/src/components/common/ExportButtons.tsx)
- [EntryWizardHeader.tsx](../../../apps/web/src/components/common/EntryWizardHeader.tsx)
- [BatchCodeBuilder.tsx](../../../apps/web/src/components/common/BatchCodeBuilder.tsx)
- [WeighbridgeReceiptDialog.tsx](../../../apps/web/src/components/WeighbridgeReceiptDialog.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
