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
| Add User | `{() => handleOpenDialog()}` | [apps/web/src/pages/UserManagement.tsx:235](../../../apps/web/src/pages/UserManagement.tsx) |
| <EditIcon fontSize="small" /> | `{() => handleOpenDialog(user)}` | [apps/web/src/pages/UserManagement.tsx:305](../../../apps/web/src/pages/UserManagement.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDelete(user.id)}` | [apps/web/src/pages/UserManagement.tsx:313](../../../apps/web/src/pages/UserManagement.tsx) |
| Cancel | `{handleCloseDialog}` | [apps/web/src/pages/UserManagement.tsx:393](../../../apps/web/src/pages/UserManagement.tsx) |
| {editingUser ? 'Update User' : 'Create User'} | `{handleSubmit}` | [apps/web/src/pages/UserManagement.tsx:394](../../../apps/web/src/pages/UserManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/users` | [apps/web/src/pages/UserManagement.tsx:78](../../../apps/web/src/pages/UserManagement.tsx) |
| POST | `/users` | [apps/web/src/pages/UserManagement.tsx:99](../../../apps/web/src/pages/UserManagement.tsx) |
| PUT | `'/users/${id}'` | [apps/web/src/pages/UserManagement.tsx:112](../../../apps/web/src/pages/UserManagement.tsx) |
| DELETE | `'/users/${id}'` | [apps/web/src/pages/UserManagement.tsx:125](../../../apps/web/src/pages/UserManagement.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [rbac.ts](../../../apps/web/src/utils/rbac.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
