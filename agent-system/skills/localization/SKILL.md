---
name: evergreen-localization
description: Keep business actions and documents understandable across supported languages. Use for new visible text, locale formatting or print changes.
---

# English and Tamil workflows

## Purpose
Keep business actions and documents understandable across supported languages.

## When to use / Trigger
New visible text, locale formatting or print changes.

## Inputs
packages/i18n; invoice/PDF text; user language preference.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Use shared translations where supported.
2. Check amounts, units, dates and long Tamil labels.
3. Verify forms, errors, saved invoice PDF and print layout.
4. Record missing translations without claiming full bilingual coverage.

## Checks / Quality Gates
- No truncated invoice amounts or untranslated critical errors.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Translation changes and locale QA record.

## Metrics
Critical strings covered; layout defects.

## Failure Modes and Anti-patterns
Translating stored identifiers; inconsistent date/currency interpretation.

## Human Review
Conditional: native-language reviewer for customer-facing wording. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[ux](../ux/SKILL.md), [documents](../documents/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-localization to the current EverGreen task. Start from packages/i18n; invoice/PDF text; user language preference. Produce translation changes and locale qa record, and show evidence for: no truncated invoice amounts or untranslated critical errors. Respect the current user scope.

## Priority and omission risk
Should-have. Skipping this work can cause: translating stored identifiers; inconsistent date/currency interpretation. Domains: i18n.
