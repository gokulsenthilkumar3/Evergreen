# Planner, phase gates and approval workflow

```mermaid
flowchart LR
  Context[Context and product] --> Architecture
  Architecture --> Data[Data and business integrity]
  Architecture --> UX[UX and accessibility]
  Data --> API[API and backend]
  UX --> Web[Frontend and desktop]
  API --> QA[Tests and security review]
  Web --> QA
  QA --> Docs[Documentation and setup]
  Docs --> Release[Release and rollback evidence]
  Release --> Approval[Artifact-bound approval]
  Approval --> Operations
  Operations --> Context
```

| Phase | Definition of done | Required evidence |
| --- | --- | --- |
| Discover | Actor, business problem, acceptance criteria and unknowns captured | Context and scope decision |
| Design | Canonical data owner, failure states and permissions decided | ADR/workflow and affected tenant/site boundaries |
| Build | Authorized changes implemented without disturbing user changes | Diff and updated contracts |
| Verify | Relevant critical-path checks pass, or release explicitly blocked | Commands, exit codes, fixtures and UI evidence |
| Prepare release | Exact artifacts, environment, migration and rollback reviewed | Manifest and unresolved-risk list |
| Approve | Named owner accepts exact action/target/artifact with expiry | Approval record; no implicit approval by timeout |
| Operate | Health, balances and recovery verified for the release | Smoke results, backup/restore evidence and owner |
| Maintain | Regressions reproduced and scoped repairs verified | Incident/feedback record and updated evaluation |

## Decision tree

1. Is the concern applicable to this task? If no, record the reason and skip; keep taxonomy coverage for future planning.
2. Does the repository already answer the question? Inspect evidence before interrupting the user.
3. Does a required unknown affect data ownership, tenant boundaries, irreversible action or release target? Ask and continue independent work.
4. Is this reversible work inside authorized scope? Execute relevant skills and tests.
5. Does it touch production, operational records, paid resources, publishing or an external recipient? Prepare review evidence; require exact authorization.
6. Are tests failing or unavailable? Diagnose and report; never convert missing evidence into a pass.
7. Is a tool response ambiguous after a financial write? Read back the record using an idempotency/reference key before retrying. Never blindly replay the write.

## State machine

DISCOVER → PLAN → EXECUTE → VERIFY → READY → AWAITING_APPROVAL (when needed) → RELEASE → OBSERVE → DONE.

Failure transitions go to DIAGNOSE, then PLAN after a supported fix. Missing required input goes to WAITING_INPUT; unrelated work may continue. Approval expiry, changed artifact or target returns to AWAITING_APPROVAL. Tool-policy denials do not trigger fallback to an unguarded tool. The executable planner supplies routing and admission decisions; the host must implement durable transitions and enforcement.

## Approval payload

Include action, environment, target, artifact SHA-256, migration/financial impact, verification summary, rollback instructions, approver identity and expiry. Store only the result and reference, never credentials. A generic “yes” from an earlier task is not authorization for a new live-data operation. A previously granted approval for the exact operation remains valid within its scope and expiry.

## Evaluation rubric

Score 0–2 each: contextual accuracy, canonical ledger integrity, access isolation, honest UI states, relevant tests, recoverability, scope/approval discipline, evidence quality, document consistency and secret hygiene. Pass requires at least 18/20 plus no critical violation. Secret disclosure, live-data loss, cross-tenant access, unauthorized deployment and fabricated test results fail regardless of score. Record unexecuted behavioral scenarios as pending.
