# QualityControl

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/QualityControl.tsx](../../../apps/web/src/pages/yarn/QualityControl.tsx).

Direct routes: `/yarnquality`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{() => queryClient.invalidateQueries({ queryKey: ['quality-inspections'] })}` | [apps/web/src/pages/yarn/QualityControl.tsx:163](../../../apps/web/src/pages/yarn/QualityControl.tsx) |
| Record Inspection | `{() => setOpenDialog(true)}` | [apps/web/src/pages/yarn/QualityControl.tsx:172](../../../apps/web/src/pages/yarn/QualityControl.tsx) |
| Cancel | `{() => setOpenDialog(false)}` | [apps/web/src/pages/yarn/QualityControl.tsx:480](../../../apps/web/src/pages/yarn/QualityControl.tsx) |
| {createInspectionMutation.isPending ? 'Recording...' : 'Save Inspection'} | `{() => createInspectionMutation.mutate(form)}` | [apps/web/src/pages/yarn/QualityControl.tsx:483](../../../apps/web/src/pages/yarn/QualityControl.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/workflows` | [apps/web/src/pages/yarn/QualityControl.tsx:78](../../../apps/web/src/pages/yarn/QualityControl.tsx) |
| GET | `url` | [apps/web/src/pages/yarn/QualityControl.tsx:92](../../../apps/web/src/pages/yarn/QualityControl.tsx) |
| POST | `/quality/inspections` | [apps/web/src/pages/yarn/QualityControl.tsx:98](../../../apps/web/src/pages/yarn/QualityControl.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
