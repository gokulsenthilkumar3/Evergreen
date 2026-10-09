---
name: evergreen-analytics
description: Produce trustworthy reports and evaluate automation against real evidence. Use for kpi, report, baseline forecast or ai proposal.
---

# Business reporting and optional forecasting

## Purpose
Produce trustworthy reports and evaluate automation against real evidence.

## When to use / Trigger
KPI, report, baseline forecast or AI proposal.

## Inputs
Canonical ledger definitions; data window; consent/retention requirements.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Define each metric and source records.
2. Reconcile totals and handle empty/stale windows.
3. For forecasts, compare against a trailing baseline with held-out data.
4. Expose uncertainty and prohibit autonomous financial decisions.
5. Use the host ML skill before actual model training/evaluation work.

## Checks / Quality Gates
- No AI label on a simple average; no PII sent to an external model without approved handling.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Metric definitions and evaluation report.

## Metrics
Ledger/report delta; forecast error versus baseline.

## Failure Modes and Anti-patterns
Fake KPIs; leakage between training/evaluation windows.

## Human Review
Conditional: data use, paid model services or automated decisions. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[data](../data/SKILL.md), [privacy](../privacy/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-analytics to the current EverGreen task. Start from Canonical ledger definitions; data window; consent/retention requirements. Produce metric definitions and evaluation report, and show evidence for: no ai label on a simple average; no pii sent to an external model without approved handling. Respect the current user scope.

## Priority and omission risk
Should-have. Skipping this work can cause: fake kpis; leakage between training/evaluation windows. Domains: Analytics, AI/ML.
