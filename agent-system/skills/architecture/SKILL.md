---
name: evergreen-architecture
description: Evolve the modular application across business, site and tenant boundaries. Use for new module, shared data ownership or deployment topology change.
---

# Architecture and scale

## Purpose
Evolve the modular application across business, site and tenant boundaries.

## When to use / Trigger
New module, shared data ownership or deployment topology change.

## Inputs
Schema; AppModule; desktop main/preload; target scale.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Map current module and persistence boundaries.
2. Identify canonical writes and site/tenant ownership.
3. Compare a modular monolith with alternatives using measured needs.
4. Record an ADR with rollout and rollback implications.

## Checks / Quality Gates
- No microservice or sync complexity without a concrete requirement; tenancy remains unverified until isolation tests pass.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
ADR and boundary diagram.

## Metrics
Cross-boundary writes; ADR assumptions resolved.

## Failure Modes and Anti-patterns
Shared global records exposed across tenants; accidental distributed transactions.

## Human Review
Conditional: owner approves topology, tenancy and material cost decisions. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[data](../data/SKILL.md), [security](../security/SKILL.md), [release](../release/SKILL.md).

## Example Prompt
Apply evergreen-architecture to the current EverGreen task. Start from Schema; AppModule; desktop main/preload; target scale. Produce adr and boundary diagram, and show evidence for: no microservice or sync complexity without a concrete requirement; tenancy remains unverified until isolation tests pass. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: shared global records exposed across tenants; accidental distributed transactions. Domains: Architecture, Scalability.
