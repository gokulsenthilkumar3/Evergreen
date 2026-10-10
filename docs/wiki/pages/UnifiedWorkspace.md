# UnifiedWorkspace

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/UnifiedWorkspace.tsx](../../../apps/web/src/pages/UnifiedWorkspace.tsx).

Direct routes: `/workspace`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Open Mill Dashboard | `{() => onNavigate('dashboard')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:195](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Yarn ERP Hub (9 Modules) | `{() => onNavigate('yarnerp')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:204](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Business Desk & Invoices | `{() => onNavigate('business')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:216](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Refresh now | `{() => { void report.refetch(); void machines.refetch(); void health.refetch(); }}` | [apps/web/src/pages/UnifiedWorkspace.tsx:233](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Review | `{() => onNavigate('reports')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:306](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {module.action} | `{() => onNavigate(module.page)}` | [apps/web/src/pages/UnifiedWorkspace.tsx:379](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Live Monitor | `{() => onNavigate('yarnlive')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:420](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Quality Lab | `{() => onNavigate('yarnquality')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:428](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Financials | `{() => onNavigate('reports')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:436](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Workflow documentation | `{() => onNavigate('tutorial')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:447](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| Health hub | `delegated / form submit` | [apps/web/src/pages/UnifiedWorkspace.tsx:448](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| API explorer (development) | `delegated / form submit` | [apps/web/src/pages/UnifiedWorkspace.tsx:449](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/report` | [apps/web/src/pages/UnifiedWorkspace.tsx:112](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| GET | `/machines` | [apps/web/src/pages/UnifiedWorkspace.tsx:117](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| GET | `/health?format=json` | [apps/web/src/pages/UnifiedWorkspace.tsx:122](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [BusinessFlowGuide.tsx](../../../apps/web/src/components/BusinessFlowGuide.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
