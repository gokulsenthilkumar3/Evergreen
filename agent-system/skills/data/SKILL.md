---
name: evergreen-data
description: Preserve stock, invoice and payment invariants through changes. Use for schema, stock, invoice, payment, cancellation or migration work.
---

# Ledger and database integrity

## Purpose
Preserve stock, invoice and payment invariants through changes.

## When to use / Trigger
Schema, stock, invoice, payment, cancellation or migration work.

## Inputs
Prisma schema; commerce service; legacy paths; disposable fixture.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Identify canonical writer and duplicate paths.
2. Define quantity and currency invariants, rounding and reversals.
3. Use atomic changes and idempotent replay semantics.
4. Test partial payment, cancellation, insufficient stock and concurrent writes.
5. Prepare reconciliation and backup/restore evidence before migration.

## Checks / Quality Gates
- No operational db push/reset; balances reconcile; failed operations leave no partial records.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Migration proposal, invariant tests and reconciliation report.

## Metrics
Unexplained stock/currency delta must be zero; duplicate effects.

## Failure Modes and Anti-patterns
Parallel ledger writes; floating-point drift; guessed data conversion.

## Human Review
Conditional: exact approval for live migration or record mutation. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[api](../api/SKILL.md), [recovery](../recovery/SKILL.md), [quality](../quality/SKILL.md).

## Example Prompt
Apply evergreen-data to the current EverGreen task. Start from Prisma schema; commerce service; legacy paths; disposable fixture. Produce migration proposal, invariant tests and reconciliation report, and show evidence for: no operational db push/reset; balances reconcile; failed operations leave no partial records. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: parallel ledger writes; floating-point drift; guessed data conversion. Domains: Database, Migration.
