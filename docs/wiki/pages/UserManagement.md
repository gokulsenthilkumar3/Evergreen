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
| Add User | `{() => handleOpenDialog()}` | [apps/web/src/pages/UserManagement.tsx:242](../../../apps/web/src/pages/UserManagement.tsx) |
| Retry | `{() => void refetch()}` | [apps/web/src/pages/UserManagement.tsx:262](../../../apps/web/src/pages/UserManagement.tsx) |
| Clear search | `{() => setSearchTerm('')}` | [apps/web/src/pages/UserManagement.tsx:306](../../../apps/web/src/pages/UserManagement.tsx) |
| {`Edit ${user.username}`} | `{() => handleOpenDialog(user)}` | [apps/web/src/pages/UserManagement.tsx:336](../../../apps/web/src/pages/UserManagement.tsx) |
| {`Delete ${user.username}`} | `{() => handleDelete(user.id)}` | [apps/web/src/pages/UserManagement.tsx:348](../../../apps/web/src/pages/UserManagement.tsx) |
| Cancel | `{handleCloseDialog}` | [apps/web/src/pages/UserManagement.tsx:447](../../../apps/web/src/pages/UserManagement.tsx) |
| {isSaving ? 'Saving…' : editingUser ? 'Update User' : 'Create User'} | `delegated / form submit` | [apps/web/src/pages/UserManagement.tsx:448](../../../apps/web/src/pages/UserManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/users` | [apps/web/src/pages/UserManagement.tsx:85](../../../apps/web/src/pages/UserManagement.tsx) |
| POST | `/users` | [apps/web/src/pages/UserManagement.tsx:106](../../../apps/web/src/pages/UserManagement.tsx) |
| PUT | `'/users/${id}'` | [apps/web/src/pages/UserManagement.tsx:119](../../../apps/web/src/pages/UserManagement.tsx) |
| DELETE | `'/users/${id}'` | [apps/web/src/pages/UserManagement.tsx:132](../../../apps/web/src/pages/UserManagement.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [rbac.ts](../../../apps/web/src/utils/rbac.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
