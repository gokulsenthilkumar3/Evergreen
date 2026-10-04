---
name: evergreen-security
description: Protect staff access, public routes and tenant data. Use for auth, session, permissions, public api or dependency change.
---

# Identity and security boundaries

## Purpose
Protect staff access, public routes and tenant data.

## When to use / Trigger
Auth, session, permissions, public API or dependency change.

## Inputs
Guards; auth/session services; roles; diff; tenant model proposal.

## Preconditions
Read [context](../../CONTEXT.md) and the [operating contract](../../SYSTEM_PROMPT.md). Identify the authorized scope and affected canonical records before work. Required inputs that are unknown stay explicit.

## Tools
Use available repository search, diff/editor, local npm/Node test tools and browser/desktop inspection where relevant. For external or privileged operations verify the host has the capability and authorization; see [tool contracts](../../tools.json).

## Steps
1. Threat-model entry points and protected data.
2. Test viewer/modifier/admin and unknown roles at the API.
3. Test revoked sessions, cross-user and cross-tenant object access.
4. Review validation, output encoding, secret handling and public rate limits.
5. Record findings before merge or release.

## Checks / Quality Gates
- No confirmed high-impact auth/data exposure left unresolved for release; no secrets in artifacts.
- Report actual checks and unexecuted checks separately.

## Outputs / Artifacts
Threat model and evidence-based findings.

## Metrics
Boundary test coverage; unresolved exploitable findings.

## Failure Modes and Anti-patterns
Trusting UI permission checks; static production secrets; tenant ID from an untrusted body.

## Human Review
Conditional: owner decides risk exceptions; agent never grants itself an exception. Existing exact authorization remains valid; routine reversible work needs no extra checkpoint.

## Related Skills
[api](../api/SKILL.md), [data](../data/SKILL.md), [privacy](../privacy/SKILL.md).

## Example Prompt
Apply evergreen-security to the current EverGreen task. Start from Guards; auth/session services; roles; diff; tenant model proposal. Produce threat model and evidence-based findings, and show evidence for: no confirmed high-impact auth/data exposure left unresolved for release; no secrets in artifacts. Respect the current user scope.

## Priority and omission risk
Must-have. Skipping this work can cause: trusting ui permission checks; static production secrets; tenant id from an untrusted body. Domains: Auth, Security.
