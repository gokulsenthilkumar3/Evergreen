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
| {uiText("Open Mill Dashboard ")} | `{() => onNavigate('dashboard')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:195](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Yarn ERP Hub (9 Modules) ")} | `{() => onNavigate('yarnerp')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:203](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Business Desk & Invoices ")} | `{() => onNavigate('business')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:214](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Refresh now")} | `{() => { void report.refetch(); void machines.refetch(); void health.refetch(); }}` | [apps/web/src/pages/UnifiedWorkspace.tsx:230](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Review")} | `{() => onNavigate('reports')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:295](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText(module.action)} | `{() => onNavigate(module.page)}` | [apps/web/src/pages/UnifiedWorkspace.tsx:366](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Live Monitor ")} | `{() => onNavigate('yarnlive')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:406](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Quality Lab ")} | `{() => onNavigate('yarnquality')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:413](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Financials ")} | `{() => onNavigate('reports')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:420](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("Workflow documentation")} | `{() => onNavigate('tutorial')}` | [apps/web/src/pages/UnifiedWorkspace.tsx:430](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| {uiText("API explorer (development)")} | `delegated / form submit` | [apps/web/src/pages/UnifiedWorkspace.tsx:431](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/report` | [apps/web/src/pages/UnifiedWorkspace.tsx:114](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| GET | `/machines` | [apps/web/src/pages/UnifiedWorkspace.tsx:119](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| GET | `/health?format=json` | [apps/web/src/pages/UnifiedWorkspace.tsx:124](../../../apps/web/src/pages/UnifiedWorkspace.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [BusinessFlowGuide.tsx](../../../apps/web/src/components/BusinessFlowGuide.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
