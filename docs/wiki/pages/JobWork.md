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
| Add Worker | `{() => setWorkerOpen(true)}` | [apps/web/src/pages/JobWork.tsx:286](../../../apps/web/src/pages/JobWork.tsx) |
| New Dispatch | `{() => setOpen(true)}` | [apps/web/src/pages/JobWork.tsx:293](../../../apps/web/src/pages/JobWork.tsx) |
| <RefreshIcon fontSize="small" /> | `{refresh}` | [apps/web/src/pages/JobWork.tsx:400](../../../apps/web/src/pages/JobWork.tsx) |
| Receive | `{() => openReceipt(job)}` | [apps/web/src/pages/JobWork.tsx:496](../../../apps/web/src/pages/JobWork.tsx) |
| Cancel & return | `{async () => { if (!window.confirm('Confirm the outstanding material has physically returned. Received material and recorded scrap will be retained.')) return; try { await api.post('/job-work/${job.id}/cancel', { notes: 'Outstanding material returned; job cancelled', returnConfirmed: true }); await refresh(); toast.success('Job cancelled; outstanding material returned once'); } catch (error: any) { toast.error(error.response?.data?.message \|\| 'Could not cancel job'); } }}` | [apps/web/src/pages/JobWork.tsx:505](../../../apps/web/src/pages/JobWork.tsx) |
| Remove | `{() => setForm({ ...form, lines: form.lines.filter((_, i) => i !== index), }) }` | [apps/web/src/pages/JobWork.tsx:623](../../../apps/web/src/pages/JobWork.tsx) |
| + Add Another Material | `{() => setForm({ ...form, lines: [...form.lines, { itemId: '', quantity: '' }], }) }` | [apps/web/src/pages/JobWork.tsx:639](../../../apps/web/src/pages/JobWork.tsx) |
| Cancel | `{() => setOpen(false)}` | [apps/web/src/pages/JobWork.tsx:662](../../../apps/web/src/pages/JobWork.tsx) |
| Confirm Dispatch | `{dispatch}` | [apps/web/src/pages/JobWork.tsx:663](../../../apps/web/src/pages/JobWork.tsx) |
| Cancel | `{() => setReceipt(null)}` | [apps/web/src/pages/JobWork.tsx:725](../../../apps/web/src/pages/JobWork.tsx) |
| Record Receipt & Close | `{saveReceipt}` | [apps/web/src/pages/JobWork.tsx:726](../../../apps/web/src/pages/JobWork.tsx) |
| Cancel | `{() => setWorkerOpen(false)}` | [apps/web/src/pages/JobWork.tsx:747](../../../apps/web/src/pages/JobWork.tsx) |
| Save Worker | `{createWorker}` | [apps/web/src/pages/JobWork.tsx:748](../../../apps/web/src/pages/JobWork.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/items` | [apps/web/src/pages/JobWork.tsx:110](../../../apps/web/src/pages/JobWork.tsx) |
| GET | `/job-work/workers` | [apps/web/src/pages/JobWork.tsx:115](../../../apps/web/src/pages/JobWork.tsx) |
| GET | `/job-work` | [apps/web/src/pages/JobWork.tsx:120](../../../apps/web/src/pages/JobWork.tsx) |
| GET | `/job-work/summary` | [apps/web/src/pages/JobWork.tsx:125](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `/job-work/workers` | [apps/web/src/pages/JobWork.tsx:143](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `/job-work/dispatch` | [apps/web/src/pages/JobWork.tsx:164](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `'/job-work/${receipt.id}/receive'` | [apps/web/src/pages/JobWork.tsx:213](../../../apps/web/src/pages/JobWork.tsx) |
| POST | `'/job-work/${job.id}/cancel'` | [apps/web/src/pages/JobWork.tsx:507](../../../apps/web/src/pages/JobWork.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
