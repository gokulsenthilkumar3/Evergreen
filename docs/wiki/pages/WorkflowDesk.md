# WorkflowDesk

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/WorkflowDesk.tsx](../../../apps/web/src/pages/WorkflowDesk.tsx).

Direct routes: `/workflows`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiText("Document trail", 'tabs')} ([apps/web/src/pages/WorkflowDesk.tsx:103](../../../apps/web/src/pages/WorkflowDesk.tsx))
- {uiText("Lots, holds & WIP", 'tabs')} ([apps/web/src/pages/WorkflowDesk.tsx:103](../../../apps/web/src/pages/WorkflowDesk.tsx))
- {uiText("Accounts & closure", 'tabs')} ([apps/web/src/pages/WorkflowDesk.tsx:103](../../../apps/web/src/pages/WorkflowDesk.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Supplier / job worker")} | `{() => setSupplierOpen(true)}` | [apps/web/src/pages/WorkflowDesk.tsx:99](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {op.title} | `{() => open(op)}` | [apps/web/src/pages/WorkflowDesk.tsx:102](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {d.documentNo} | `{() => setSelectedDoc(d)}` | [apps/web/src/pages/WorkflowDesk.tsx:104](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Inspect & release", 'tables')} | `{() => { setRelease(h); setReleaseNotes(''); }}` | [apps/web/src/pages/WorkflowDesk.tsx:105](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Close through a date")} | `{() => setCloseOpen(true)}` | [apps/web/src/pages/WorkflowDesk.tsx:106](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Add line")} | `{() => setLines(old => [...old, { itemId: '', quantity: '', rate: '', gstRate: '' }])}` | [apps/web/src/pages/WorkflowDesk.tsx:108](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Cancel")} | `{() => setOperation(null)}` | [apps/web/src/pages/WorkflowDesk.tsx:109](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {saving ? uiText("Posting…") : uiText("Post & synchronize")} | `{submit}` | [apps/web/src/pages/WorkflowDesk.tsx:109](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Cancel")} | `{() => setSupplierOpen(false)}` | [apps/web/src/pages/WorkflowDesk.tsx:110](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Save")} | `{async () => { setSaving(true); try { await api.post('/workflows/suppliers', supplier); setSupplierOpen(false); setSupplier({ name: '', code: '', gstin: '', address: '' }); } catch (e: any) { toast.error(uiText(e.response?.data?.message \|\| 'Could not save supplier', 'feedback')); } finally { setSaving(false); } }}` | [apps/web/src/pages/WorkflowDesk.tsx:110](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Cancel")} | `{() => setRelease(null)}` | [apps/web/src/pages/WorkflowDesk.tsx:111](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Record pass & release")} | `{handleRelease}` | [apps/web/src/pages/WorkflowDesk.tsx:111](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Cancel")} | `{() => setCloseOpen(false)}` | [apps/web/src/pages/WorkflowDesk.tsx:112](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Close period")} | `{async () => { setSaving(true); try { await api.post('/workflows/periods/close', { through: closeDate, notes: closeNotes }); setCloseOpen(false); } catch (e: any) { toast.error(uiText(e.response?.data?.message \|\| 'Closure failed', 'feedback')); } finally { setSaving(false); } }}` | [apps/web/src/pages/WorkflowDesk.tsx:112](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Download document PDF")} | `{() => downloadWorkflowDocument(selectedDoc)}` | [apps/web/src/pages/WorkflowDesk.tsx:113](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| {uiText("Close")} | `{() => setSelectedDoc(null)}` | [apps/web/src/pages/WorkflowDesk.tsx:113](../../../apps/web/src/pages/WorkflowDesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/workflows` | [apps/web/src/pages/WorkflowDesk.tsx:52](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `/commerce/invoices` | [apps/web/src/pages/WorkflowDesk.tsx:86](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `'/workflows/orders/${form.orderId}/amend'` | [apps/web/src/pages/WorkflowDesk.tsx:87](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `'/commerce/orders/${form.orderId}/cancel'` | [apps/web/src/pages/WorkflowDesk.tsx:88](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `'/workflows/post/${operation.kind}'` | [apps/web/src/pages/WorkflowDesk.tsx:89](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `'/workflows/holds/${release.id}/release'` | [apps/web/src/pages/WorkflowDesk.tsx:94](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `/workflows/suppliers` | [apps/web/src/pages/WorkflowDesk.tsx:110](../../../apps/web/src/pages/WorkflowDesk.tsx) |
| POST | `/workflows/periods/close` | [apps/web/src/pages/WorkflowDesk.tsx:112](../../../apps/web/src/pages/WorkflowDesk.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [authStorage.ts](../../../apps/web/src/utils/authStorage.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [workflowDocument.ts](../../../apps/web/src/utils/workflowDocument.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
