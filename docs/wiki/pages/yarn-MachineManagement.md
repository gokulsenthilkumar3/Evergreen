# MachineManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/MachineManagement.tsx](../../../apps/web/src/pages/yarn/MachineManagement.tsx).

Direct routes: `/yarnmachine`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiScopedTemplate('tabs')`Machine Registry (${machines.length})`} ([apps/web/src/pages/yarn/MachineManagement.tsx:285](../../../apps/web/src/pages/yarn/MachineManagement.tsx))
- {uiScopedTemplate('tabs')`Maintenance & Inspections (${inspections.length})`} ([apps/web/src/pages/yarn/MachineManagement.tsx:286](../../../apps/web/src/pages/yarn/MachineManagement.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Refresh ")} | `{() => { queryClient.invalidateQueries({ queryKey: ['machines'] }); queryClient.invalidateQueries({ queryKey: ['machine-inspections'] }); }}` | [apps/web/src/pages/yarn/MachineManagement.tsx:186](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {uiText("Register Machine ")} | `{() => setOpenMachineDialog(true)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:198](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {uiText("Log Maintenance ")} | `{() => setOpenInspectionDialog(true)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:205](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {uiText("Cancel ")} | `{() => setOpenMachineDialog(false)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:527](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {createMachineMutation.isPending ? uiText("Registering...") : uiText("Register Machine")} | `{() => createMachineMutation.mutate(machineForm)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:529](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {uiText("Cancel ")} | `{() => setOpenInspectionDialog(false)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:642](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {createInspectionMutation.isPending ? uiText("Logging...") : uiText("Save Inspection")} | `{() => createInspectionMutation.mutate(inspectionForm)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:644](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/machines` | [apps/web/src/pages/yarn/MachineManagement.tsx:102](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| GET | `/machines/inspections` | [apps/web/src/pages/yarn/MachineManagement.tsx:112](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| POST | `/machines` | [apps/web/src/pages/yarn/MachineManagement.tsx:117](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| POST | `/machines/inspections` | [apps/web/src/pages/yarn/MachineManagement.tsx:138](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
