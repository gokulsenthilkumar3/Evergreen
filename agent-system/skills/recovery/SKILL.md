---
name: evergreen-recovery
description: Prove that SQLite and hosted data can be restored consistently. Use for migration, cutover, release or recovery drill.
---

# Backup and disaster recovery

## Purpose
Prove that SQLite and hosted data can be restored consistently.

## When to use / Trigger
Migration, cutover, release or recovery drill.

## Inputs
Database location; active writers; backup mechanism; RPO/RTO owner.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Identify SQLite journal mode and a consistent online backup method.
2. Preserve a manifest and checksums without exposing records.
3. Restore into an isolated location.
4. Reconcile row counts, stock balances, invoices and payment totals.
5. Measure restore time and record cutover/rollback conditions.

## Checks / Quality Gates
- File copying an active database alone is not proof of a consistent backup; restore drill required before live cutover.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Verified backup manifest and restore evidence.

## Metrics
Measured recovery time and data loss window.

## Failure Modes and Anti-patterns
Overwriting the only backup; restoring over live records without approval.

## Human Review
Conditional: operational backup access, live restore or migration. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[data](../data/SKILL.md), [operations](../operations/SKILL.md), [release](../release/SKILL.md).

## Example Prompt
Apply evergreen-recovery to the current EverGreen task. Start from Database location; active writers; backup mechanism; RPO/RTO owner. Produce verified backup manifest and restore evidence, and show evidence for: file copying an active database alone is not proof of a consistent backup; restore drill required before live cutover. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: overwriting the only backup; restoring over live records without approval. Domains: Backup/DR.
