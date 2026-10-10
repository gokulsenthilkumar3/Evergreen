# ShiftManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/ShiftManagement.tsx](../../../apps/web/src/pages/yarn/ShiftManagement.tsx).

Direct routes: `/yarnshift`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{() => queryClient.invalidateQueries({ queryKey: ['hr-shifts'] })}` | [apps/web/src/pages/yarn/ShiftManagement.tsx:83](../../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| Add Shift | `{handleOpen}` | [apps/web/src/pages/yarn/ShiftManagement.tsx:89](../../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| Cancel | `{() => setOpen(false)}` | [apps/web/src/pages/yarn/ShiftManagement.tsx:176](../../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| Save shift | `{() => createShift.mutate()}` | [apps/web/src/pages/yarn/ShiftManagement.tsx:177](../../../apps/web/src/pages/yarn/ShiftManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/hr/shifts` | [apps/web/src/pages/yarn/ShiftManagement.tsx:39](../../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| POST | `/hr/shifts` | [apps/web/src/pages/yarn/ShiftManagement.tsx:43](../../../apps/web/src/pages/yarn/ShiftManagement.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
