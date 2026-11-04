# OperationsDesk

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/OperationsDesk.tsx](../../../apps/web/src/pages/OperationsDesk.tsx).

Direct routes: `/operations`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiScopedTemplate('tabs')`Inward Receipts (${receipts.length})`} ([apps/web/src/pages/OperationsDesk.tsx:372](../../../apps/web/src/pages/OperationsDesk.tsx))
- {uiScopedTemplate('tabs')`Costing History (${costings.length})`} ([apps/web/src/pages/OperationsDesk.tsx:377](../../../apps/web/src/pages/OperationsDesk.tsx))
- {uiScopedTemplate('tabs')`Stock Traceability (${items.length})`} ([apps/web/src/pages/OperationsDesk.tsx:382](../../../apps/web/src/pages/OperationsDesk.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Receive Stock ")} | `{() => setInwardOpen(true)}` | [apps/web/src/pages/OperationsDesk.tsx:283](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("New Costing Sheet ")} | `{() => setCostOpen(true)}` | [apps/web/src/pages/OperationsDesk.tsx:289](../../../apps/web/src/pages/OperationsDesk.tsx) |
| <RefreshIcon fontSize="small" /> | `{refresh}` | [apps/web/src/pages/OperationsDesk.tsx:405](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Print ", 'tables')} | `{print}` | [apps/web/src/pages/OperationsDesk.tsx:465](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Duplicate ", 'tables')} | `{() => { try { const comps = typeof c.components === 'string' ? JSON.parse(c.components) : c.components \|\| []; setCosting({ styleCode: '${c.styleCode}-COPY', description: c.description \|\| '', components: comps.map((x: any) => ({ ...x, quantity: String(x.quantity \|\| x.qty \|\| ''), rate: String(x.rate \|\| ''), })), }); setCostOpen(true); } catch { toast.error(uiText('Could not parse costing components', 'feedback')); } }}` | [apps/web/src/pages/OperationsDesk.tsx:530](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("View History ", 'tables')} | `{async () => { try { setHistoryName(i.name); const res = await api.get('/commerce/items/${i.id}/movements'); setHistory(res.data); } catch { toast.error(uiText('Could not load movements ledger', 'feedback')); } }}` | [apps/web/src/pages/OperationsDesk.tsx:607](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Remove ")} | `{() => setInward({ ...inward, lines: inward.lines.filter((_, i) => i !== index), }) }` | [apps/web/src/pages/OperationsDesk.tsx:725](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("+ Add Item Line ")} | `{() => setInward({ ...inward, lines: [...inward.lines, newRow()] })}` | [apps/web/src/pages/OperationsDesk.tsx:740](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Cancel")} | `{() => setInwardOpen(false)}` | [apps/web/src/pages/OperationsDesk.tsx:754](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Post Receipt to Stock ")} | `{saveInward}` | [apps/web/src/pages/OperationsDesk.tsx:755](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Remove ")} | `{() => setCosting({ ...costing, components: costing.components.filter((_, i) => i !== index), }) }` | [apps/web/src/pages/OperationsDesk.tsx:860](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("+ Add Component ")} | `{() => setCosting({ ...costing, components: [ ...costing.components, { type: 'MATERIAL', description: '', quantity: '', rate: '' }, ], }) }` | [apps/web/src/pages/OperationsDesk.tsx:875](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Cancel")} | `{() => setCostOpen(false)}` | [apps/web/src/pages/OperationsDesk.tsx:897](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Save Costing Sheet ")} | `{saveCost}` | [apps/web/src/pages/OperationsDesk.tsx:898](../../../apps/web/src/pages/OperationsDesk.tsx) |
| {uiText("Close")} | `{() => setHistory(null)}` | [apps/web/src/pages/OperationsDesk.tsx:974](../../../apps/web/src/pages/OperationsDesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/items` | [apps/web/src/pages/OperationsDesk.tsx:74](../../../apps/web/src/pages/OperationsDesk.tsx) |
| GET | `/commerce/inward-receipts` | [apps/web/src/pages/OperationsDesk.tsx:79](../../../apps/web/src/pages/OperationsDesk.tsx) |
| GET | `/commerce/costing-sheets` | [apps/web/src/pages/OperationsDesk.tsx:84](../../../apps/web/src/pages/OperationsDesk.tsx) |
| POST | `/commerce/inward-receipts` | [apps/web/src/pages/OperationsDesk.tsx:150](../../../apps/web/src/pages/OperationsDesk.tsx) |
| POST | `/commerce/costing-sheets` | [apps/web/src/pages/OperationsDesk.tsx:179](../../../apps/web/src/pages/OperationsDesk.tsx) |
| GET | `'/commerce/items/${i.id}/movements'` | [apps/web/src/pages/OperationsDesk.tsx:614](../../../apps/web/src/pages/OperationsDesk.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
