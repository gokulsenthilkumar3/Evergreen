# OperationsDesk

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/OperationsDesk.tsx](../../../apps/web/src/pages/OperationsDesk.tsx).

Direct routes: `/operations`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {`Inward Receipts (${receipts.length})`} ([apps/web/src/pages/OperationsDesk.tsx:373](../../../apps/web/src/pages/OperationsDesk.tsx))
- {`Costing History (${costings.length})`} ([apps/web/src/pages/OperationsDesk.tsx:378](../../../apps/web/src/pages/OperationsDesk.tsx))
- {`Stock Traceability (${items.length})`} ([apps/web/src/pages/OperationsDesk.tsx:383](../../../apps/web/src/pages/OperationsDesk.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Receive Stock | `{() => setInwardOpen(true)}` | [apps/web/src/pages/OperationsDesk.tsx:282](../../../apps/web/src/pages/OperationsDesk.tsx) |
| New Costing Sheet | `{() => setCostOpen(true)}` | [apps/web/src/pages/OperationsDesk.tsx:289](../../../apps/web/src/pages/OperationsDesk.tsx) |
| <RefreshIcon fontSize="small" /> | `{refresh}` | [apps/web/src/pages/OperationsDesk.tsx:406](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Print | `{print}` | [apps/web/src/pages/OperationsDesk.tsx:468](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Duplicate | `{() => { try { const comps = typeof c.components === 'string' ? JSON.parse(c.components) : c.components \|\| []; setCosting({ styleCode: '${c.styleCode}-COPY', description: c.description \|\| '', components: comps.map((x: any) => ({ ...x, quantity: String(x.quantity \|\| x.qty \|\| ''), rate: String(x.rate \|\| ''), })), }); setCostOpen(true); } catch { toast.error('Could not parse costing components'); } }}` | [apps/web/src/pages/OperationsDesk.tsx:536](../../../apps/web/src/pages/OperationsDesk.tsx) |
| View History | `{async () => { try { setHistoryName(i.name); const res = await api.get('/commerce/items/${i.id}/movements'); setHistory(res.data); } catch { toast.error('Could not load movements ledger'); } }}` | [apps/web/src/pages/OperationsDesk.tsx:616](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Remove | `{() => setInward({ ...inward, lines: inward.lines.filter((_, i) => i !== index), }) }` | [apps/web/src/pages/OperationsDesk.tsx:737](../../../apps/web/src/pages/OperationsDesk.tsx) |
| + Add Item Line | `{() => setInward({ ...inward, lines: [...inward.lines, newRow()] })}` | [apps/web/src/pages/OperationsDesk.tsx:753](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Cancel | `{() => setInwardOpen(false)}` | [apps/web/src/pages/OperationsDesk.tsx:768](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Post Receipt to Stock | `{saveInward}` | [apps/web/src/pages/OperationsDesk.tsx:769](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Remove | `{() => setCosting({ ...costing, components: costing.components.filter((_, i) => i !== index), }) }` | [apps/web/src/pages/OperationsDesk.tsx:877](../../../apps/web/src/pages/OperationsDesk.tsx) |
| + Add Component | `{() => setCosting({ ...costing, components: [ ...costing.components, { type: 'MATERIAL', description: '', quantity: '', rate: '' }, ], }) }` | [apps/web/src/pages/OperationsDesk.tsx:893](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Cancel | `{() => setCostOpen(false)}` | [apps/web/src/pages/OperationsDesk.tsx:916](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Save Costing Sheet | `{saveCost}` | [apps/web/src/pages/OperationsDesk.tsx:917](../../../apps/web/src/pages/OperationsDesk.tsx) |
| Close | `{() => setHistory(null)}` | [apps/web/src/pages/OperationsDesk.tsx:997](../../../apps/web/src/pages/OperationsDesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/items` | [apps/web/src/pages/OperationsDesk.tsx:71](../../../apps/web/src/pages/OperationsDesk.tsx) |
| GET | `/commerce/inward-receipts` | [apps/web/src/pages/OperationsDesk.tsx:76](../../../apps/web/src/pages/OperationsDesk.tsx) |
| GET | `/commerce/costing-sheets` | [apps/web/src/pages/OperationsDesk.tsx:81](../../../apps/web/src/pages/OperationsDesk.tsx) |
| POST | `/commerce/inward-receipts` | [apps/web/src/pages/OperationsDesk.tsx:147](../../../apps/web/src/pages/OperationsDesk.tsx) |
| POST | `/commerce/costing-sheets` | [apps/web/src/pages/OperationsDesk.tsx:176](../../../apps/web/src/pages/OperationsDesk.tsx) |
| GET | `'/commerce/items/${i.id}/movements'` | [apps/web/src/pages/OperationsDesk.tsx:623](../../../apps/web/src/pages/OperationsDesk.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
