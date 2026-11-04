# UserManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/UserManagement.tsx](../../../apps/web/src/pages/UserManagement.tsx).

Direct routes: `/users`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText('Compare roles')} | `{() => setShowRoles(true)}` | [apps/web/src/pages/UserManagement.tsx:314](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Refresh')} | `{() => void refetch()}` | [apps/web/src/pages/UserManagement.tsx:317](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Export filtered users')} | `{exportUsers}` | [apps/web/src/pages/UserManagement.tsx:318](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText("Add User ")} | `{() => handleOpenDialog()}` | [apps/web/src/pages/UserManagement.tsx:319](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText("Retry")} | `{() => void refetch()}` | [apps/web/src/pages/UserManagement.tsx:339](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Clear filters')} | `{clearFilters}` | [apps/web/src/pages/UserManagement.tsx:374](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Save view')} | `{saveView}` | [apps/web/src/pages/UserManagement.tsx:375](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Restore view')} | `{restoreView}` | [apps/web/src/pages/UserManagement.tsx:375](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText("Clear search", 'tables')} | `{clearFilters}` | [apps/web/src/pages/UserManagement.tsx:404](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiScopedTemplate('tables')`View ${user.username}`} | `{() => setDetailUserId(user.id)}` | [apps/web/src/pages/UserManagement.tsx:437](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiScopedTemplate('tables')`Edit ${user.username}`} | `{() => handleOpenDialog(user)}` | [apps/web/src/pages/UserManagement.tsx:439](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiScopedTemplate('tables')`Delete ${user.username}`} | `{() => handleDelete(user)}` | [apps/web/src/pages/UserManagement.tsx:451](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Close')} | `{() => setDetailUserId(null)}` | [apps/web/src/pages/UserManagement.tsx:495](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Edit User')} | `{() => { if (detailUser) { setDetailUserId(null); handleOpenDialog(detailUser); } }}` | [apps/web/src/pages/UserManagement.tsx:496](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText('Close')} | `{() => setShowRoles(false)}` | [apps/web/src/pages/UserManagement.tsx:505](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText(showPassword ? 'Hide password' : 'Show password', 'forms')} | `{() => setShowPassword(value => !value)}` | [apps/web/src/pages/UserManagement.tsx:550](../../../apps/web/src/pages/UserManagement.tsx) |
| {uiText("Cancel")} | `{handleCloseDialog}` | [apps/web/src/pages/UserManagement.tsx:593](../../../apps/web/src/pages/UserManagement.tsx) |
| {isSaving ? uiText("Saving…") : editingUser ? uiText("Update User") : uiText("Create User")} | `delegated / form submit` | [apps/web/src/pages/UserManagement.tsx:594](../../../apps/web/src/pages/UserManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/users` | [apps/web/src/pages/UserManagement.tsx:135](../../../apps/web/src/pages/UserManagement.tsx) |
| POST | `/users` | [apps/web/src/pages/UserManagement.tsx:177](../../../apps/web/src/pages/UserManagement.tsx) |
| PUT | `'/users/${id}'` | [apps/web/src/pages/UserManagement.tsx:190](../../../apps/web/src/pages/UserManagement.tsx) |
| DELETE | `'/users/${id}'` | [apps/web/src/pages/UserManagement.tsx:203](../../../apps/web/src/pages/UserManagement.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [rbac.ts](../../../apps/web/src/utils/rbac.ts)
- [csvGenerator.ts](../../../apps/web/src/utils/csvGenerator.ts)
- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [UserSecurityInspector.tsx](../../../apps/web/src/components/UserSecurityInspector.tsx)
- [UserLifecycleControls.tsx](../../../apps/web/src/components/UserLifecycleControls.tsx)
- [UserInvitations.tsx](../../../apps/web/src/components/UserInvitations.tsx)
- [UserEndpointAccess.tsx](../../../apps/web/src/components/UserEndpointAccess.tsx)
- [SessionPolicySettings.tsx](../../../apps/web/src/components/SessionPolicySettings.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
