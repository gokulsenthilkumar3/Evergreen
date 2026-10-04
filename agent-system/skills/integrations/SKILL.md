---
name: evergreen-integrations
description: Add providers without duplicate financial effects or unsupported status claims. Use for payment, accounting, tax, email or device provider integration.
---

# External integration contracts

## Purpose
Add providers without duplicate financial effects or unsupported status claims.

## When to use / Trigger
Payment, accounting, tax, email or device provider integration.

## Inputs
Approved provider; sandbox; webhook/auth specification; retries.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Verify current primary provider docs and supported contract.
2. Use sandbox credentials and validate signatures/replay windows.
3. Persist correlation and idempotency keys.
4. Handle partial failure and read-back before retries.
5. Distinguish internal creation from provider acceptance.

## Checks / Quality Gates
- No claimed delivery/filing success without provider evidence; no live test sends without authorization.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Adapter, contract tests and failure runbook.

## Metrics
Duplicate effects; reconciliation lag; provider failures.

## Failure Modes and Anti-patterns
Unsigned webhooks; retrying charged payments; fake integrations.

## Human Review
Conditional: provider purchase, external sends or live records. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[api](../api/SKILL.md), [data](../data/SKILL.md), [security](../security/SKILL.md).

## Example Prompt
Apply evergreen-integrations to the current EverGreen task. Start from Approved provider; sandbox; webhook/auth specification; retries. Produce adapter, contract tests and failure runbook, and show evidence for: no claimed delivery/filing success without provider evidence; no live test sends without authorization. Respect the current user scope.

## Priority and omission risk
Should-have. Skipping this work can cause: unsigned webhooks; retrying charged payments; fake integrations. Domains: Integrations.
