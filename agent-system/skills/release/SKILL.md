---
name: evergreen-release
description: Produce reproducible, reversible desktop and hosted releases. Use for ci change, release candidate, hosting or installer work.
---

# Delivery and release engineering

## Purpose
Produce reproducible, reversible desktop and hosted releases.

## When to use / Trigger
CI change, release candidate, hosting or installer work.

## Inputs
Lockfile; build commands; deployment target; signing owner; migration plan.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Build from reproducible dependencies and record artifact hashes.
2. Run required critical-path and boundary checks.
3. Prepare hosted routing/configuration and desktop package verification.
4. Attach backup/migration/rollback evidence.
5. Request exact production/publishing approval, then verify health and business smoke checks.

## Checks / Quality Gates
- No deployment based only on compilation; no secrets in artifacts; no unsigned claim of desktop trust.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Release manifest, pipeline and rollback runbook.

## Metrics
Deploy failure rate; rollback time; artifact reproducibility.

## Failure Modes and Anti-patterns
Shipping dev secrets; stale bundled backend; mixing per-tenant environments.

## Human Review
Yes for production deployment, signing/publishing or paid infrastructure. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[quality](../quality/SKILL.md), [recovery](../recovery/SKILL.md), [operations](../operations/SKILL.md).

## Example Prompt
Apply evergreen-release to the current EverGreen task. Start from Lockfile; build commands; deployment target; signing owner; migration plan. Produce release manifest, pipeline and rollback runbook, and show evidence for: no deployment based only on compilation; no secrets in artifacts; no unsigned claim of desktop trust. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: shipping dev secrets; stale bundled backend; mixing per-tenant environments. Domains: CI/CD, Infrastructure, Release.
