# JobWork

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/JobWork.tsx](../../../apps/web/src/pages/JobWork.tsx).

Direct routes: `/jobwork`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Add Worker ")} | `{() => setWorkerOpen(true)}` | [apps/web/src/pages/JobWork.tsx:299](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("New Dispatch ")} | `{() => setOpen(true)}` | [apps/web/src/pages/JobWork.tsx:305](../../../apps/web/src/pages/JobWork.tsx) |
| <RefreshIcon fontSize="small" /> | `{refresh}` | [apps/web/src/pages/JobWork.tsx:411](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Receive ", 'tables')} | `{() => openReceipt(job)}` | [apps/web/src/pages/JobWork.tsx:504](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Cancel & return", 'tables')} | `{async () => { if (!window.confirm('Confirm the outstanding material has physically returned. Received material and recorded scrap will be retained.')) return; try { await api.post('/job-work/${job.id}/cancel', { notes: 'Outstanding material returned; job cancelled', returnConfirmed: true }); await refresh(); toast.success(uiText('Job cancelled; outstanding material returned once', 'feedback')); } catch (error: any) { toast.error(uiText(error.response?.data?.message \|\| 'Could not cancel job', 'feedback')); } }}` | [apps/web/src/pages/JobWork.tsx:512](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Remove ")} | `{() => setForm({ ...form, lines: form.lines.filter((_, i) => i !== index), }) }` | [apps/web/src/pages/JobWork.tsx:628](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("+ Add Another Material ")} | `{() => setForm({ ...form, lines: [...form.lines, { itemId: '', quantity: '' }], }) }` | [apps/web/src/pages/JobWork.tsx:643](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Cancel")} | `{() => setOpen(false)}` | [apps/web/src/pages/JobWork.tsx:665](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Confirm Dispatch ")} | `{dispatch}` | [apps/web/src/pages/JobWork.tsx:666](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Cancel")} | `{() => setReceipt(null)}` | [apps/web/src/pages/JobWork.tsx:727](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Record Receipt & Close ")} | `{saveReceipt}` | [apps/web/src/pages/JobWork.tsx:728](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Cancel")} | `{() => setWorkerOpen(false)}` | [apps/web/src/pages/JobWork.tsx:748](../../../apps/web/src/pages/JobWork.tsx) |
| {uiText("Save Worker ")} | `{createWorker}` | [apps/web/src/pages/JobWork.tsx:749](../../../apps/web/src/pages/JobWork.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/items` | [apps/web/src/pages/JobWork.tsx:113](../../../apps/web/src/pages/JobWork.tsx) |
| GET | `/job-work/workers` | [apps/web/src/pages/JobWork.tsx:118](../../../apps/web/src/pages/JobWork.tsx) |
| GET | `/job-work` | [apps/web/src/pages/JobWork.tsx:123](../../../apps/web/src/pages/JobWork.tsx) |
| GET | `/job-work/summary` | [apps/web/src/pages/JobWork.tsx:128](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `/job-work/workers` | [apps/web/src/pages/JobWork.tsx:158](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `/job-work/dispatch` | [apps/web/src/pages/JobWork.tsx:179](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `'/job-work/${receipt.id}/receive'` | [apps/web/src/pages/JobWork.tsx:228](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `'/job-work/${job.id}/cancel'` | [apps/web/src/pages/JobWork.tsx:514](../../../apps/web/src/pages/JobWork.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
