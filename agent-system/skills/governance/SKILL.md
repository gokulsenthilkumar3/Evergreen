---
name: evergreen-governance
description: Assign ownership and make delivery tradeoffs visible. Use for roadmap, release risk, budget or cross-team dependency.
---

# Team, cost and stakeholder decisions

## Purpose
Assign ownership and make delivery tradeoffs visible.

## When to use / Trigger
Roadmap, release risk, budget or cross-team dependency.

## Inputs
Owner list; estimates; unresolved risks; operating cost evidence.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Name decision and operational owners.
2. Prioritize ledger integrity, isolation and recovery.
3. Estimate recurring hosting/support cost with stated assumptions.
4. Track top risks and acceptance decisions.
5. Communicate outcomes without sending externally unless authorized.

## Checks / Quality Gates
- No hiring, spending or legal commitments by the agent; unknown owners remain explicit.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Roadmap, risk register and decision record.

## Metrics
Unowned risks; estimated versus actual cost.

## Failure Modes and Anti-patterns
Claiming all 310 concerns are implemented; process ceremony without a decision.

## Human Review
Yes for budgets, commitments and human-only business decisions. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[product](../product/SKILL.md), [release](../release/SKILL.md).

## Example Prompt
Apply evergreen-governance to the current EverGreen task. Start from Owner list; estimates; unresolved risks; operating cost evidence. Produce roadmap, risk register and decision record, and show evidence for: no hiring, spending or legal commitments by the agent; unknown owners remain explicit. Respect the current user scope.

## Priority and omission risk
Should-have. Skipping this work can cause: claiming all 310 concerns are implemented; process ceremony without a decision. Domains: Team Process, Cost.
