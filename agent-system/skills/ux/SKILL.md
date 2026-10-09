---
name: evergreen-ux
description: Make receipt-to-payment usable and truthful on narrow and wide screens. Use for workflow, navigation, form or dashboard change.
---

# Business UX and accessibility

## Purpose
Make receipt-to-payment usable and truthful on narrow and wide screens.

## When to use / Trigger
Workflow, navigation, form or dashboard change.

## Inputs
User task; existing MUI components; API states.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Walk the handoff and its error/recovery path.
2. Reuse theme tokens and accessible controls.
3. Implement loading, empty, stale, failure and permission states.
4. Check keyboard focus, labels, narrow layouts, dark mode and reduced motion.

## Checks / Quality Gates
- No invented zero balances or healthy statuses; actions remain operable by keyboard; future accessibility conformance needs an audit.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
UI change and interaction evidence.

## Metrics
Task completion; inaccessible controls; hidden failure states.

## Failure Modes and Anti-patterns
Clickable non-buttons; clipped amounts; motion without a reduced-motion path.

## Human Review
Conditional: owner reviews materially changed business steps. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[frontend](../frontend/SKILL.md), [quality](../quality/SKILL.md), [localization](../localization/SKILL.md).

## Example Prompt
Apply evergreen-ux to the current EverGreen task. Start from User task; existing MUI components; API states. Produce ui change and interaction evidence, and show evidence for: no invented zero balances or healthy statuses; actions remain operable by keyboard; future accessibility conformance needs an audit. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: clickable non-buttons; clipped amounts; motion without a reduced-motion path. Domains: UX/UI, Accessibility.
