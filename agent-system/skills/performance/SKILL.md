---
name: evergreen-performance
description: Measure bottlenecks before scaling infrastructure. Use for slow dashboard, large inventory or increased site/tenant load.
---

# Performance and capacity

## Purpose
Measure bottlenecks before scaling infrastructure.

## When to use / Trigger
Slow dashboard, large inventory or increased site/tenant load.

## Inputs
Representative synthetic data; timings; bundle/build reports.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Capture baseline query, API and render timings.
2. Inspect query cardinality, indexing, payloads and large lazy chunks.
3. Apply the smallest measured improvement.
4. Repeat the same workload and document capacity limits.

## Checks / Quality Gates
- No performance claim without workload and before/after evidence; no load testing live business data.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Benchmark and targeted improvement.

## Metrics
p95 latency; payload bytes; bundle size; memory.

## Failure Modes and Anti-patterns
Caching tenant data without tenant keys; sharding before measurement.

## Human Review
Conditional: external load tests or infrastructure spend. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[architecture](../architecture/SKILL.md), [data](../data/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-performance to the current EverGreen task. Start from Representative synthetic data; timings; bundle/build reports. Produce benchmark and targeted improvement, and show evidence for: no performance claim without workload and before/after evidence; no load testing live business data. Respect the current user scope.

## Priority and omission risk
Should-have. Skipping this work can cause: caching tenant data without tenant keys; sharding before measurement. Domains: Performance.
