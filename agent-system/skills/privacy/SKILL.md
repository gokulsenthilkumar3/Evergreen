---
name: evergreen-privacy
description: Turn owner-approved obligations into testable handling of business and staff data. Use for personal data, retention, export, tax/provider or licensing change.
---

# Privacy, compliance and legal evidence

## Purpose
Turn owner-approved obligations into testable handling of business and staff data.

## When to use / Trigger
Personal data, retention, export, tax/provider or licensing change.

## Inputs
Data inventory; business jurisdictions; approved obligations; license inventory.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Inventory customer, employee, authentication and invoice fields.
2. Ask for jurisdiction/retention decisions when missing.
3. Verify current authoritative requirements before legal implementation.
4. Minimize collection and redact logs/test fixtures.
5. Document retention/export/delete design and preserve required financial history.

## Checks / Quality Gates
- No unsupported legal/certification claims; owner review for legal interpretation; no real PII in evaluation data.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Data map, obligation register and implementation evidence.

## Metrics
Unowned sensitive fields; overdue retention decisions.

## Failure Modes and Anti-patterns
Assuming every regulation applies; silently deleting financial history.

## Human Review
Yes for legal applicability, retention and policy acceptance. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[security](../security/SKILL.md), [data](../data/SKILL.md), [operations](../operations/SKILL.md).

## Example Prompt
Apply evergreen-privacy to the current EverGreen task. Start from Data inventory; business jurisdictions; approved obligations; license inventory. Produce data map, obligation register and implementation evidence, and show evidence for: no unsupported legal/certification claims; owner review for legal interpretation; no real pii in evaluation data. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: assuming every regulation applies; silently deleting financial history. Domains: Privacy, Compliance, Legal.
