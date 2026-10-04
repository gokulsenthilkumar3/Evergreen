---
name: evergreen-frontend
description: Keep React screens consistent with server records and navigation. Use for query, mutation, route or staff/public screen change.
---

# React data flows

## Purpose
Keep React screens consistent with server records and navigation.

## When to use / Trigger
Query, mutation, route or staff/public screen change.

## Inputs
App.tsx; utils/api.ts; TanStack query keys; endpoint contract.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Trace API base URL and authentication behavior.
2. Use stable cache keys and invalidate affected summaries after writes.
3. Prevent repeated submission and expose errors without losing user input.
4. Verify browser Back, refresh, deep links and stale data behavior.

## Checks / Quality Gates
- No client-only authorization or fallback success; shop data cannot expose staff/customer internals.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Components and focused interaction tests.

## Metrics
Failed requests surfaced; mutation-to-summary consistency.

## Failure Modes and Anti-patterns
Hardcoded operational badges; swallowed exceptions; duplicate submissions.

## Human Review
No for authorized reversible code changes. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[ux](../ux/SKILL.md), [api](../api/SKILL.md), [security](../security/SKILL.md).

## Example Prompt
Apply evergreen-frontend to the current EverGreen task. Start from App.tsx; utils/api.ts; TanStack query keys; endpoint contract. Produce components and focused interaction tests, and show evidence for: no client-only authorization or fallback success; shop data cannot expose staff/customer internals. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: hardcoded operational badges; swallowed exceptions; duplicate submissions. Domains: Frontend, Web, Error Handling.
