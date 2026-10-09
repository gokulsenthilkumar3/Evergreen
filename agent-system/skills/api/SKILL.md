---
name: evergreen-api
description: Keep endpoints validated, scoped and usable through desktop and web paths. Use for endpoint or business mutation change.
---

# Nest API contracts

## Purpose
Keep endpoints validated, scoped and usable through desktop and web paths.

## When to use / Trigger
Endpoint or business mutation change.

## Inputs
Controller; service; DTO; Swagger; guards.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Trace global and route guards.
2. Define DTO validation and explicit response/errors.
3. Keep state changes in service transactions and document replay behavior.
4. Verify proxy /api/backend and direct API server selection.

## Checks / Quality Gates
- Malformed/unknown fields rejected on DTO routes; role/site/tenant checks tested; Swagger examples use synthetic data.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Controller/service changes and contract tests.

## Metrics
Typed write routes; authorization denials tested.

## Failure Modes and Anti-patterns
Any bodies treated as validated; write retries creating duplicates.

## Human Review
Conditional: incompatible contracts or live migrations. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[data](../data/SKILL.md), [security](../security/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-api to the current EverGreen task. Start from Controller; service; DTO; Swagger; guards. Produce controller/service changes and contract tests, and show evidence for: malformed/unknown fields rejected on dto routes; role/site/tenant checks tested; swagger examples use synthetic data. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: any bodies treated as validated; write retries creating duplicates. Domains: Backend, API.
