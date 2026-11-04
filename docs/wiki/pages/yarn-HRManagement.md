# HRManagement

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/yarn/HRManagement.tsx](../../../apps/web/src/pages/yarn/HRManagement.tsx).

Direct routes: `/yarnhr`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiScopedTemplate('tabs')`Staff Directory (${employees.length})`} ([apps/web/src/pages/yarn/HRManagement.tsx:323](../../../apps/web/src/pages/yarn/HRManagement.tsx))
- {uiScopedTemplate('tabs')`Payroll Processing (${payroll.length})`} ([apps/web/src/pages/yarn/HRManagement.tsx:324](../../../apps/web/src/pages/yarn/HRManagement.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Refresh ")} | `{() => { queryClient.invalidateQueries({ queryKey: ['hr-staff'] }); queryClient.invalidateQueries({ queryKey: ['hr-payroll'] }); }}` | [apps/web/src/pages/yarn/HRManagement.tsx:223](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| {uiText("Add Staff ")} | `{() => setOpenStaffDialog(true)}` | [apps/web/src/pages/yarn/HRManagement.tsx:235](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| {uiText("Process Payroll ")} | `{() => setOpenPayrollDialog(true)}` | [apps/web/src/pages/yarn/HRManagement.tsx:242](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| {uiText("Cancel ")} | `{() => setOpenStaffDialog(false)}` | [apps/web/src/pages/yarn/HRManagement.tsx:614](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| {createStaffMutation.isPending ? uiText("Saving...") : uiText("Register Staff")} | `{() => createStaffMutation.mutate(staffForm)}` | [apps/web/src/pages/yarn/HRManagement.tsx:616](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| {uiText("Cancel ")} | `{() => setOpenPayrollDialog(false)}` | [apps/web/src/pages/yarn/HRManagement.tsx:728](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| {createPayrollMutation.isPending ? uiText("Processing...") : uiText("Submit Payroll")} | `{() => createPayrollMutation.mutate(payrollForm)}` | [apps/web/src/pages/yarn/HRManagement.tsx:730](../../../apps/web/src/pages/yarn/HRManagement.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/hr/staff` | [apps/web/src/pages/yarn/HRManagement.tsx:112](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| GET | `'/hr/payroll?month=${currentMonth}'` | [apps/web/src/pages/yarn/HRManagement.tsx:122](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| POST | `/hr/staff` | [apps/web/src/pages/yarn/HRManagement.tsx:127](../../../apps/web/src/pages/yarn/HRManagement.tsx) |
| POST | `/hr/payroll` | [apps/web/src/pages/yarn/HRManagement.tsx:156](../../../apps/web/src/pages/yarn/HRManagement.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
