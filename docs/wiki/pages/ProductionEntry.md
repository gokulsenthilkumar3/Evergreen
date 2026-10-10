# ProductionEntry

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/ProductionEntry.tsx](../../../apps/web/src/pages/ProductionEntry.tsx).

Direct routes: `/production`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Yarn Production ([apps/web/src/pages/ProductionEntry.tsx:809](../../../apps/web/src/pages/ProductionEntry.tsx))
- Waste Breakdown ([apps/web/src/pages/ProductionEntry.tsx:810](../../../apps/web/src/pages/ProductionEntry.tsx))
- Intermediate ([apps/web/src/pages/ProductionEntry.tsx:811](../../../apps/web/src/pages/ProductionEntry.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Add Production | `{handleOpenWizard}` | [apps/web/src/pages/ProductionEntry.tsx:525](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Generate QR and Barcode Label | `{() => setLabelProduction(row)}` | [apps/web/src/pages/ProductionEntry.tsx:603](../../../apps/web/src/pages/ProductionEntry.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteProduction(row.id)}` | [apps/web/src/pages/ProductionEntry.tsx:614](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Remove cotton row | `{() => removeConsumed(item.id)}` | [apps/web/src/pages/ProductionEntry.tsx:772](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Add Row | `{addConsumed}` | [apps/web/src/pages/ProductionEntry.tsx:788](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Remove yarn row | `{() => removeProduced(item.id)}` | [apps/web/src/pages/ProductionEntry.tsx:867](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Add Count | `{addProduced}` | [apps/web/src/pages/ProductionEntry.tsx:882](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Back | `{handleBack}` | [apps/web/src/pages/ProductionEntry.tsx:1007](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {isSaving ? 'Saving…' : 'Save Production'} | `{handleSave}` | [apps/web/src/pages/ProductionEntry.tsx:1016](../../../apps/web/src/pages/ProductionEntry.tsx) |
| Next | `{handleNext}` | [apps/web/src/pages/ProductionEntry.tsx:1025](../../../apps/web/src/pages/ProductionEntry.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/production` | [apps/web/src/pages/ProductionEntry.tsx:127](../../../apps/web/src/pages/ProductionEntry.tsx) |
| GET | `/inventory/available-batches` | [apps/web/src/pages/ProductionEntry.tsx:145](../../../apps/web/src/pages/ProductionEntry.tsx) |
| GET | `/settings` | [apps/web/src/pages/ProductionEntry.tsx:153](../../../apps/web/src/pages/ProductionEntry.tsx) |
| GET | `/inventory/yarn-stock` | [apps/web/src/pages/ProductionEntry.tsx:161](../../../apps/web/src/pages/ProductionEntry.tsx) |
| POST | `/production` | [apps/web/src/pages/ProductionEntry.tsx:380](../../../apps/web/src/pages/ProductionEntry.tsx) |
| DELETE | `'/production/${id}'` | [apps/web/src/pages/ProductionEntry.tsx:410](../../../apps/web/src/pages/ProductionEntry.tsx) |

## Composed behavior

- [BarcodeQRModal.tsx](../../../apps/web/src/components/common/BarcodeQRModal.tsx)
- [codeFormatters.ts](../../../apps/web/src/utils/codeFormatters.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [excelGenerator.ts](../../../apps/web/src/utils/excelGenerator.ts)
- [pdfGenerator.ts](../../../apps/web/src/utils/pdfGenerator.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [deleteGuardHandler.ts](../../../apps/web/src/utils/deleteGuardHandler.ts)
- [productionTiming.ts](../../../apps/web/src/utils/productionTiming.ts)
- [ProductionTimingAlert.tsx](../../../apps/web/src/components/common/ProductionTimingAlert.tsx)
- [validators.ts](../../../apps/web/src/utils/validators.ts)
- [EmptyState.tsx](../../../apps/web/src/components/common/EmptyState.tsx)
- [TableSkeleton.tsx](../../../apps/web/src/components/common/TableSkeleton.tsx)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)
- [ExportButtons.tsx](../../../apps/web/src/components/common/ExportButtons.tsx)
- [EntryWizardHeader.tsx](../../../apps/web/src/components/common/EntryWizardHeader.tsx)
- [dateFilters.ts](../../../apps/web/src/utils/dateFilters.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
