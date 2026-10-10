# CostingHistory

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CostingHistory.tsx](../../../apps/web/src/pages/CostingHistory.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Dashboard ([apps/web/src/pages/CostingHistory.tsx:233](../../../apps/web/src/pages/CostingHistory.tsx))
- History ([apps/web/src/pages/CostingHistory.tsx:234](../../../apps/web/src/pages/CostingHistory.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/costing/dashboard` | [apps/web/src/pages/CostingHistory.tsx:117](../../../apps/web/src/pages/CostingHistory.tsx) |
| GET | `/costing/history` | [apps/web/src/pages/CostingHistory.tsx:127](../../../apps/web/src/pages/CostingHistory.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [excelGenerator.ts](../../../apps/web/src/utils/excelGenerator.ts)
- [pdfGenerator.ts](../../../apps/web/src/utils/pdfGenerator.ts)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)
- [ExportButtons.tsx](../../../apps/web/src/components/common/ExportButtons.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
