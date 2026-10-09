---
name: evergreen-product
description: Translate textile business needs into verifiable handoffs. Use for new feature, unclear request or changed acceptance criteria.
---

# Product and requirements

## Purpose
Translate textile business needs into verifiable handoffs.

## When to use / Trigger
New feature, unclear request or changed acceptance criteria.

## Inputs
User request; CONTEXT.md; PARITY_REGISTER.md.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Identify staff/customer actor and affected handoff.
2. Trace the existing screen, endpoint and ledger owner.
3. Write measurable acceptance criteria and unresolved assumptions.
4. Prioritize data integrity and recovery before expansion.

## Checks / Quality Gates
- Every criterion has an evidence source; no planned capability presented as delivered.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Scoped brief and acceptance matrix.

## Metrics
Acceptance criteria verified; unresolved assumptions.

## Failure Modes and Anti-patterns
Invented personas or release readiness; cosmetic work masking broken handoffs.

## Human Review
Conditional: business owner decides pricing, scope conflicts and acceptance. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[architecture](../architecture/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-product to the current EverGreen task. Start from User request; CONTEXT.md; PARITY_REGISTER.md. Produce scoped brief and acceptance matrix, and show evidence for: every criterion has an evidence source; no planned capability presented as delivered. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: invented personas or release readiness; cosmetic work masking broken handoffs. Domains: Product, Requirements, Risk, Stakeholder Communication.
