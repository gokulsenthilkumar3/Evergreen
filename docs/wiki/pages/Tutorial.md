# Tutorial

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Tutorial.tsx](../../../apps/web/src/pages/Tutorial.tsx).

Direct routes: `/tutorial`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("Open related workspace", 'help')} | `{() => onNavigate(({ activation: 'settings', integrations: 'integrations', support: 'helpdesk', inventory: 'inventory', billing: 'business', costing: 'costing', admin: 'users' } as Record<string, string>)[selectedChapter] \|\| 'dashboard')}` | [apps/web/src/pages/Tutorial.tsx:280](../../../apps/web/src/pages/Tutorial.tsx) |
| {step.label} | `{() => setActiveStep(i)}` | [apps/web/src/pages/Tutorial.tsx:285](../../../apps/web/src/pages/Tutorial.tsx) |
| {i === chapter.steps.length - 1 ? uiText("Finish chapter", 'help') : uiText("Got it →", 'help')} | `{handleStepComplete}` | [apps/web/src/pages/Tutorial.tsx:290](../../../apps/web/src/pages/Tutorial.tsx) |
| {uiText("Back", 'help')} | `{() => setActiveStep(i - 1)}` | [apps/web/src/pages/Tutorial.tsx:291](../../../apps/web/src/pages/Tutorial.tsx) |
| {uiText("Next chapter →", 'help')} | `{() => { const nextIndex = TUTORIAL_CHAPTERS.findIndex((c) => c.id === selectedChapter) + 1; if (nextIndex < TUTORIAL_CHAPTERS.length) { handleChapterChange(TUTORIAL_CHAPTERS[nextIndex].id); } }}` | [apps/web/src/pages/Tutorial.tsx:304](../../../apps/web/src/pages/Tutorial.tsx) |
| {uiText("Restart tour", 'help')} | `{() => { setCompletedSteps({}); setSelectedChapter('getting-started'); setActiveStep(0); }}` | [apps/web/src/pages/Tutorial.tsx:305](../../../apps/web/src/pages/Tutorial.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [authStorage.ts](../../../apps/web/src/utils/authStorage.ts)
- [BusinessFlowGuide.tsx](../../../apps/web/src/components/BusinessFlowGuide.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
