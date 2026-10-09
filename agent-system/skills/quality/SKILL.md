---
name: evergreen-quality
description: Verify business outcomes and recovery behavior, not implementation wording. Use for feature, bug fix or release candidate.
---

# Critical-path verification

## Purpose
Verify business outcomes and recovery behavior, not implementation wording.

## When to use / Trigger
Feature, bug fix or release candidate.

## Inputs
Acceptance criteria; diff; disposable database; test commands.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Choose tests for changed invariants and regressions.
2. Exercise success, validation, role denial, timeout and replay paths.
3. Run relevant TypeScript/build checks and focused tests.
4. Perform action-level browser/desktop checks where affected.
5. Record exact results and distinguish failures from missing capabilities.

## Checks / Quality Gates
- No fabricated green gates; money/stock paths need meaningful tests; schema checks alone do not prove behavior.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Test evidence and unresolved defects.

## Metrics
Critical scenarios passed; regressions; flaky tests.

## Failure Modes and Anti-patterns
Broad snapshots instead of invariants; fixtures using operational records.

## Human Review
Conditional: release acceptance and unresolved risk. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[data](../data/SKILL.md), [frontend](../frontend/SKILL.md), [security](../security/SKILL.md).

## Example Prompt
Apply evergreen-quality to the current EverGreen task. Start from Acceptance criteria; diff; disposable database; test commands. Produce test evidence and unresolved defects, and show evidence for: no fabricated green gates; money/stock paths need meaningful tests; schema checks alone do not prove behavior. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: broad snapshots instead of invariants; fixtures using operational records. Domains: Testing, Code Quality.
