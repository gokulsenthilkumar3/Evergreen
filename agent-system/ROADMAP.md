# Tailored implementation plan

The dates below are planning windows, not promised delivery dates. Staffing, hosting budget, legal requirements and acceptance owners are still open. Skill-level MoSCoW priorities and omission risks appear in every card; all 310 concern priorities appear in taxonomy.md.

| Window | Deliverable | Exit evidence / human checkpoint |
| --- | --- | --- |
| Days 1–30 | Reconcile current receipt-to-payment paths; accurate UI states; reproducible setup; test fixtures; skill/router/memory/evaluation foundation | Owner accepts canonical ledger plan; critical money/stock tests; restored backup on a disposable environment |
| Days 31–60 | Prove desktop and hosted packaging; implement approved site/tenant model and access boundaries; establish observability and CI gates | Architecture owner signs topology; cross-site and cross-tenant denial tests; installer/hosted rollback checks |
| Days 61–90 | Pilot one business, then multiple sites, then separate customer businesses only after isolation gates; evaluate authorized integrations | Release approval per artifact/target; operational reconciliation; restore drill; support owner and incident runbook |

## Agent foundation order

1. Host capability inventory and workspace/secret boundary.
2. Context and canonical data ownership map.
3. Typed read/edit/check tool adapters; no arbitrary remote shell endpoint.
4. Deterministic policy router and authenticated approval store.
5. Redacted memory and correlated logs with retention/access policy.
6. Behavioral evaluations plus deterministic boundary tests.
7. Only then add provider/deployment adapters, each with sandbox tests and least privilege.

## Autonomy

The agent may inspect, edit reversible source/docs, build and test disposable fixtures within authorization. Human owners decide business commitments, legal applicability, tenant architecture, live migrations, external communications, infrastructure spending and production/installer publishing. Routine local fixes must not get stuck behind release checkpoints. Scope-specific existing authorization is reused.

## Top ten risks

| Risk | Mitigation / acceptance evidence |
| --- | --- |
| Parallel mill/commerce ledgers | Canonical writer map; zero unexplained reconciliation delta |
| Cross-business data exposure | Server-side tenant ownership on queries, exports, jobs and caches; negative tests |
| Desktop/cloud conflicts | Explicit online/offline ownership decision; idempotency and conflict tests before sync |
| Duplicate financial effects | Request identity, atomic writes and read-back after uncertain responses |
| Inconsistent backup | Restore rehearsal with stock/invoice/payment checks and measured recovery time |
| Unsupported UI claims | States tied to actual endpoint evidence and timestamps |
| Incomplete API contracts | DTO/guard/error coverage and write-path contract tests |
| Release/version skew | Signed/versioned manifest for web, API, desktop and schema; rollback test |
| Sensitive data in agent tools | Host redaction, protected paths and synthetic fixtures; injection evaluations |
| Excessive roadmap scope | Stage single business → sites → tenants; budget and owner decisions at each gate |

## Example runs

**Dashboard failure fix:** agent selects frontend + UX + quality; reproduces API failure with a fixture, fixes stale/unavailable display, runs focused tests and updates guide. No production approval is needed for the local source change.

**Tenant-aware export:** agent reads schema and guards, identifies absent ownership boundaries, writes an ADR and fixture-level implementation proposal. It does not treat an organization selector as security. Cross-tenant tests and owner acceptance precede rollout.

**Hosted release:** agent builds and hashes the artifact, gathers tests and recovery evidence, presents the exact environment and rollback. Host verifies the named approver and expiry, rechecks the artifact hash, executes the approved adapter, then records post-release checks. Changed artifact returns to approval.

## Feedback and observability

Record task ID, skill versions, stage, tool/check name, elapsed time, result, retry count, redacted error category and artifact reference. Do not log prompts containing business records by default. Monitor unauthorized attempts, fabricated-evidence findings, behavioral scenario pass rate, completion rate, cost per task and approval latency. A failure becomes a minimal reproducible scenario before it becomes a new rule. Review skill versions and rejected/expired approvals during retrospectives.
