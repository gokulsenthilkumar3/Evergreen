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
| {i === chapter.steps.length - 1 ? 'Finish chapter' : 'Got it →'} | `{handleStepComplete}` | [apps/web/src/pages/Tutorial.tsx:245](../../../apps/web/src/pages/Tutorial.tsx) |
| Back | `{() => setActiveStep(i - 1)}` | [apps/web/src/pages/Tutorial.tsx:246](../../../apps/web/src/pages/Tutorial.tsx) |
| Next chapter → | `{() => { const nextIndex = TUTORIAL_CHAPTERS.findIndex((c) => c.id === selectedChapter) + 1; if (nextIndex < TUTORIAL_CHAPTERS.length) { handleChapterChange(TUTORIAL_CHAPTERS[nextIndex].id); } }}` | [apps/web/src/pages/Tutorial.tsx:259](../../../apps/web/src/pages/Tutorial.tsx) |
| Restart tour | `{() => { setCompletedSteps({}); setSelectedChapter('getting-started'); setActiveStep(0); }}` | [apps/web/src/pages/Tutorial.tsx:260](../../../apps/web/src/pages/Tutorial.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |

## Composed behavior

- [BusinessFlowGuide.tsx](../../../apps/web/src/components/BusinessFlowGuide.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
