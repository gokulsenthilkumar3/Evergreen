# ProductionEntry

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/ProductionEntry.tsx](../../../apps/web/src/pages/ProductionEntry.tsx).

Direct routes: `/production`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiText("Yarn Production", 'tabs')} ([apps/web/src/pages/ProductionEntry.tsx:808](../../../apps/web/src/pages/ProductionEntry.tsx))
- {uiText("Waste Breakdown", 'tabs')} ([apps/web/src/pages/ProductionEntry.tsx:809](../../../apps/web/src/pages/ProductionEntry.tsx))
- {uiText("Intermediate", 'tabs')} ([apps/web/src/pages/ProductionEntry.tsx:810](../../../apps/web/src/pages/ProductionEntry.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Add Production ")} | `{handleOpenWizard}` | [apps/web/src/pages/ProductionEntry.tsx:528](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Generate QR and Barcode Label", 'tables')} | `{() => setLabelProduction(row)}` | [apps/web/src/pages/ProductionEntry.tsx:605](../../../apps/web/src/pages/ProductionEntry.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeleteProduction(row.id)}` | [apps/web/src/pages/ProductionEntry.tsx:616](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Remove cotton row", 'tables')} | `{() => removeConsumed(item.id)}` | [apps/web/src/pages/ProductionEntry.tsx:772](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Add Row ")} | `{addConsumed}` | [apps/web/src/pages/ProductionEntry.tsx:788](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Remove yarn row", 'tables')} | `{() => removeProduced(item.id)}` | [apps/web/src/pages/ProductionEntry.tsx:865](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Add Count ")} | `{addProduced}` | [apps/web/src/pages/ProductionEntry.tsx:880](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Back ")} | `{handleBack}` | [apps/web/src/pages/ProductionEntry.tsx:1000](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {isSaving ? uiText("Saving…") : uiText("Save Production")} | `{handleSave}` | [apps/web/src/pages/ProductionEntry.tsx:1008](../../../apps/web/src/pages/ProductionEntry.tsx) |
| {uiText("Next ")} | `{handleNext}` | [apps/web/src/pages/ProductionEntry.tsx:1017](../../../apps/web/src/pages/ProductionEntry.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/production` | [apps/web/src/pages/ProductionEntry.tsx:131](../../../apps/web/src/pages/ProductionEntry.tsx) |
| GET | `/inventory/available-batches` | [apps/web/src/pages/ProductionEntry.tsx:149](../../../apps/web/src/pages/ProductionEntry.tsx) |
| GET | `/settings` | [apps/web/src/pages/ProductionEntry.tsx:157](../../../apps/web/src/pages/ProductionEntry.tsx) |
| GET | `/inventory/yarn-stock` | [apps/web/src/pages/ProductionEntry.tsx:165](../../../apps/web/src/pages/ProductionEntry.tsx) |
| POST | `/production` | [apps/web/src/pages/ProductionEntry.tsx:384](../../../apps/web/src/pages/ProductionEntry.tsx) |
| DELETE | `'/production/${id}'` | [apps/web/src/pages/ProductionEntry.tsx:414](../../../apps/web/src/pages/ProductionEntry.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
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
