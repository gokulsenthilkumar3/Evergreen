---
name: evergreen-dependencies
description: Keep the monorepo supportable without uncontrolled upgrades. Use for dependency update, technical debt or framework change.
---

# Dependency and maintenance hygiene

## Purpose
Keep the monorepo supportable without uncontrolled upgrades.

## When to use / Trigger
Dependency update, technical debt or framework change.

## Inputs
Lockfile; manifests; usage sites; advisory evidence.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Identify affected workspaces and runtime compatibility.
2. Read authoritative release/advisory information for proposed changes.
3. Choose bounded updates and preserve reproducibility.
4. Test impacted web, API and desktop behavior.
5. Document unresolved advisory or migration risks.

## Checks / Quality Gates
- No blanket major upgrades or audit-fix force without review; runtime support verified.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Bounded dependency diff and compatibility evidence.

## Metrics
Known applicable advisories; upgrade regressions.

## Failure Modes and Anti-patterns
Updating bundled desktop code independently; treating audit counts as exploitability proof.

## Human Review
Conditional: breaking architecture or licensing changes. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[quality](../quality/SKILL.md), [security](../security/SKILL.md), [desktop](../desktop/SKILL.md).

## Example Prompt
Apply evergreen-dependencies to the current EverGreen task. Start from Lockfile; manifests; usage sites; advisory evidence. Produce bounded dependency diff and compatibility evidence, and show evidence for: no blanket major upgrades or audit-fix force without review; runtime support verified. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: updating bundled desktop code independently; treating audit counts as exploitability proof. Domains: Dependencies, Maintenance.
