# SessionManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/SessionManagement.tsx](../../../apps/web/src/pages/SessionManagement.tsx).

Direct routes: `/sessions`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText('Retry')} | `{()=>void refetch()}` | [apps/web/src/pages/SessionManagement.tsx:76](../../../apps/web/src/pages/SessionManagement.tsx) |
| {uiText("Revoke ", 'tables')} | `{async () => { if (await confirm({title:uiText('Revoke sessions'),message:uiText('Revoke this session? If it is your current session, you will be signed out.'),severity:'warning'})) { revokeSessionMutation.mutate(session.id); } }}` | [apps/web/src/pages/SessionManagement.tsx:161](../../../apps/web/src/pages/SessionManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/sessions` | [apps/web/src/pages/SessionManagement.tsx:36](../../../apps/web/src/pages/SessionManagement.tsx) |
| DELETE | `'/sessions/${id}/revoke'` | [apps/web/src/pages/SessionManagement.tsx:52](../../../apps/web/src/pages/SessionManagement.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [EmptyState.tsx](../../../apps/web/src/components/common/EmptyState.tsx)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
