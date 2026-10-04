---
name: evergreen-operations
description: Expose meaningful failures and recover service without corrupting records. Use for health, logging, alert, scheduled job or incident work.
---

# Reliability and observability

## Purpose
Expose meaningful failures and recover service without corrupting records.

## When to use / Trigger
Health, logging, alert, scheduled job or incident work.

## Inputs
Health controller/service; redacted logs; owner; target SLO.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Trace request/job correlation and distinguish checks from assumed status.
2. Define useful dependency health and timestamp freshness.
3. Redact tokens, personal data and financial details.
4. Connect actionable alerts to an owner and runbook.
5. During incidents preserve evidence, limit impact and reconcile uncertain writes.

## Checks / Quality Gates
- Unknown status is not healthy; alerts have response instructions; recovery does not blindly replay financial writes.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Health/alert changes and incident runbook.

## Metrics
Detection/recovery time; stale health; actionable alert ratio.

## Failure Modes and Anti-patterns
Success responses for failed processors; noisy unowned alerts.

## Human Review
Conditional: live operational changes and external incident communications. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[recovery](../recovery/SKILL.md), [security](../security/SKILL.md), [release](../release/SKILL.md).

## Example Prompt
Apply evergreen-operations to the current EverGreen task. Start from Health controller/service; redacted logs; owner; target SLO. Produce health/alert changes and incident runbook, and show evidence for: unknown status is not healthy; alerts have response instructions; recovery does not blindly replay financial writes. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: success responses for failed processors; noisy unowned alerts. Domains: Reliability, Observability, Logging, Monitoring, Alerting, Incident Response.
