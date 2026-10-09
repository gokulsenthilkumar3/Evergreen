---
name: evergreen-documents
description: Keep setup, guides and API/PDF behavior aligned with the application. Use for workflow, service url, configuration or generated document change.
---

# Documentation and developer setup

## Purpose
Keep setup, guides and API/PDF behavior aligned with the application.

## When to use / Trigger
Workflow, service URL, configuration or generated document change.

## Inputs
README; QUICK_START; Tutorial; BusinessFlowGuide; Swagger; packages/pdf.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Trace commands and links to actual scripts/routes.
2. Use one shared source for repeated workflow instructions.
3. Document configured ports, bootstrap secrets and new-vs-existing database steps.
4. Verify saved invoice data and shared totals drive documents.
5. Mark legacy guides and future features clearly.

## Checks / Quality Gates
- No default shared passwords; no misleading release claims; setup does not mutate existing data automatically.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Updated guides, links and setup diagnostics.

## Metrics
Broken links; reproducible setup; document/record differences.

## Failure Modes and Anti-patterns
Copying framework README boilerplate; recalculating invoice totals differently in PDF.

## Human Review
No for authorized documentation; conditional for changing invoice semantics. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[data](../data/SKILL.md), [localization](../localization/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-documents to the current EverGreen task. Start from README; QUICK_START; Tutorial; BusinessFlowGuide; Swagger; packages/pdf. Produce updated guides, links and setup diagnostics, and show evidence for: no default shared passwords; no misleading release claims; setup does not mutate existing data automatically. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: copying framework readme boilerplate; recalculating invoice totals differently in pdf. Domains: Documentation, DevEx.
