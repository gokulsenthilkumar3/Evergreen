---
name: evergreen-desktop
description: Keep the Electron delivery aligned with hosted workflows and explicit offline limits. Use for installer, preload/ipc, updater, local backend or offline change.
---

# Desktop and platform support

## Purpose
Keep the Electron delivery aligned with hosted workflows and explicit offline limits.

## When to use / Trigger
Installer, preload/IPC, updater, local backend or offline change.

## Inputs
apps/desktop; API base URL; supported Windows versions; sync decision.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Trace bundled web/backend versions and local database location.
2. Review Electron process isolation and IPC contracts.
3. Test install, launch, update and rollback on a disposable profile.
4. Decide online-hosted versus local ownership before offline writes.
5. Treat native mobile as a separate optional product, not implied by responsive web.

## Checks / Quality Gates
- No silently divergent schemas or bidirectional sync; updates preserve operational data.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Platform compatibility and package verification record.

## Metrics
Version skew; installation success; sync conflicts.

## Failure Modes and Anti-patterns
Editing packaged backend as a second source of truth; untrusted IPC.

## Human Review
Conditional: installer publishing, signing and destructive updates. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[release](../release/SKILL.md), [security](../security/SKILL.md), [data](../data/SKILL.md).

## Example Prompt
Apply evergreen-desktop to the current EverGreen task. Start from apps/desktop; API base URL; supported Windows versions; sync decision. Produce platform compatibility and package verification record, and show evidence for: no silently divergent schemas or bidirectional sync; updates preserve operational data. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: editing packaged backend as a second source of truth; untrusted ipc. Domains: Desktop, Mobile.
