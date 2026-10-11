# MachineManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/MachineManagement.tsx](../../../apps/web/src/pages/yarn/MachineManagement.tsx).

Direct routes: `/yarnmachine`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {`Machine Registry (${machines.length})`} ([apps/web/src/pages/yarn/MachineManagement.tsx:293](../../../apps/web/src/pages/yarn/MachineManagement.tsx))
- {`Maintenance & Inspections (${inspections.length})`} ([apps/web/src/pages/yarn/MachineManagement.tsx:294](../../../apps/web/src/pages/yarn/MachineManagement.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Refresh | `{() => { queryClient.invalidateQueries({ queryKey: ['machines'] }); queryClient.invalidateQueries({ queryKey: ['machine-inspections'] }); }}` | [apps/web/src/pages/yarn/MachineManagement.tsx:186](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| Register Machine | `{() => setOpenMachineDialog(true)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:199](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| Log Maintenance | `{() => setOpenInspectionDialog(true)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:207](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| Cancel | `{() => setOpenMachineDialog(false)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:540](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {createMachineMutation.isPending ? 'Registering...' : 'Register Machine'} | `{() => createMachineMutation.mutate(machineForm)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:543](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| Cancel | `{() => setOpenInspectionDialog(false)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:657](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| {createInspectionMutation.isPending ? 'Logging...' : 'Save Inspection'} | `{() => createInspectionMutation.mutate(inspectionForm)}` | [apps/web/src/pages/yarn/MachineManagement.tsx:660](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/machines` | [apps/web/src/pages/yarn/MachineManagement.tsx:100](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| GET | `/machines/inspections` | [apps/web/src/pages/yarn/MachineManagement.tsx:110](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| POST | `/machines` | [apps/web/src/pages/yarn/MachineManagement.tsx:115](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| POST | `/machines/inspections` | [apps/web/src/pages/yarn/MachineManagement.tsx:136](../../../apps/web/src/pages/yarn/MachineManagement.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
