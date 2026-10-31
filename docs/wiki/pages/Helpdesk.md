# Helpdesk

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Helpdesk.tsx](../../../apps/web/src/pages/Helpdesk.tsx).

Direct routes: `/helpdesk`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{() => void tickets.refetch()}` | [apps/web/src/pages/Helpdesk.tsx:241](../../../apps/web/src/pages/Helpdesk.tsx) |
| Retry | `{() => void tickets.refetch()}` | [apps/web/src/pages/Helpdesk.tsx:282](../../../apps/web/src/pages/Helpdesk.tsx) |
| Update status | `{() => { setSelected(ticket); setStatus(ticket.status); setResolution(ticket.resolution \|\| ""); update.reset(); }}` | [apps/web/src/pages/Helpdesk.tsx:346](../../../apps/web/src/pages/Helpdesk.tsx) |
| {create.isPending ? "Saving ticket..." : "Save ticket to installation"} | `delegated / form submit` | [apps/web/src/pages/Helpdesk.tsx:449](../../../apps/web/src/pages/Helpdesk.tsx) |
| {draft.subject} | `{() => setForm({ ...initialForm, subject: draft.subject.slice(0, 160), description: draft.description.slice(0, 4000), }) }` | [apps/web/src/pages/Helpdesk.tsx:473](../../../apps/web/src/pages/Helpdesk.tsx) |
| Cancel | `{() => setSelected(null)}` | [apps/web/src/pages/Helpdesk.tsx:551](../../../apps/web/src/pages/Helpdesk.tsx) |
| {update.isPending ? "Saving..." : "Save update"} | `{() => update.mutate()}` | [apps/web/src/pages/Helpdesk.tsx:554](../../../apps/web/src/pages/Helpdesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/helpdesk/tickets` | [apps/web/src/pages/Helpdesk.tsx:125](../../../apps/web/src/pages/Helpdesk.tsx) |
| POST | `/helpdesk/tickets` | [apps/web/src/pages/Helpdesk.tsx:139](../../../apps/web/src/pages/Helpdesk.tsx) |
| PATCH | `'/helpdesk/tickets/${selected!.id}'` | [apps/web/src/pages/Helpdesk.tsx:156](../../../apps/web/src/pages/Helpdesk.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [authStorage.ts](../../../apps/web/src/utils/authStorage.ts)
- [StaffAssistant.tsx](../../../apps/web/src/components/StaffAssistant.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
