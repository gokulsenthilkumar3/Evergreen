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
| {uiText("Refresh ")} | `{() => void tickets.refetch()}` | [apps/web/src/pages/Helpdesk.tsx:351](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Export this page as CSV")} | `{() => tableToCSV( [ "id", "subject", "category", "priority", "status", "requester", "createdAt", ], rows.map((row) => [ row.id, row.subject, row.category, row.priority, row.status, row.createdBy, row.createdAt, ]), "helpdesk-current-page", ) }` | [apps/web/src/pages/Helpdesk.tsx:468](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Retry")} | `{() => void tickets.refetch()}` | [apps/web/src/pages/Helpdesk.tsx:516](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Open conversation and proof")} | `{() => setInspectedId(ticket.id)}` | [apps/web/src/pages/Helpdesk.tsx:609](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Update status ")} | `{() => { setSelected(ticket); setStatus(ticket.status); setResolution(ticket.resolution \|\| ""); update.reset(); }}` | [apps/web/src/pages/Helpdesk.tsx:617](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Previous page")} | `{() => { setCursor(previousCursors[previousCursors.length - 1]); setPreviousCursors((previous) => previous.slice(0, -1)); }}` | [apps/web/src/pages/Helpdesk.tsx:638](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Next page")} | `{() => { setPreviousCursors((previous) => [...previous, cursor]); setCursor(nextCursor \|\| null); }}` | [apps/web/src/pages/Helpdesk.tsx:647](../../../apps/web/src/pages/Helpdesk.tsx) |
| {create.isPending ? uiText("Saving ticket...") : uiText("Save ticket to installation")} | `delegated / form submit` | [apps/web/src/pages/Helpdesk.tsx:757](../../../apps/web/src/pages/Helpdesk.tsx) |
| {draft.subject} | `{() => setForm({ ...initialForm, subject: draft.subject.slice(0, 160), description: draft.description.slice(0, 4000), }) }` | [apps/web/src/pages/Helpdesk.tsx:782](../../../apps/web/src/pages/Helpdesk.tsx) |
| {uiText("Cancel ")} | `{() => setSelected(null)}` | [apps/web/src/pages/Helpdesk.tsx:868](../../../apps/web/src/pages/Helpdesk.tsx) |
| {update.isPending ? uiText("Saving...") : uiText("Save update")} | `{() => update.mutate()}` | [apps/web/src/pages/Helpdesk.tsx:871](../../../apps/web/src/pages/Helpdesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/helpdesk/queue` | [apps/web/src/pages/Helpdesk.tsx:190](../../../apps/web/src/pages/Helpdesk.tsx) |
| GET | `/helpdesk/resources/QUEUE` | [apps/web/src/pages/Helpdesk.tsx:207](../../../apps/web/src/pages/Helpdesk.tsx) |
| GET | `/helpdesk/resources/CATEGORY` | [apps/web/src/pages/Helpdesk.tsx:211](../../../apps/web/src/pages/Helpdesk.tsx) |
| POST | `/helpdesk/tickets` | [apps/web/src/pages/Helpdesk.tsx:224](../../../apps/web/src/pages/Helpdesk.tsx) |
| PATCH | `'/helpdesk/tickets/${selected!.id}'` | [apps/web/src/pages/Helpdesk.tsx:241](../../../apps/web/src/pages/Helpdesk.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [authStorage.ts](../../../apps/web/src/utils/authStorage.ts)
- [StaffAssistant.tsx](../../../apps/web/src/components/StaffAssistant.tsx)
- [HelpdeskTicketInspector.tsx](../../../apps/web/src/components/HelpdeskTicketInspector.tsx)
- [HelpdeskOperationsPanel.tsx](../../../apps/web/src/components/HelpdeskOperationsPanel.tsx)
- [HelpdeskBulkImport.tsx](../../../apps/web/src/components/HelpdeskBulkImport.tsx)
- [csvGenerator.ts](../../../apps/web/src/utils/csvGenerator.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
