# Documentation

Start with the [Quick Start](../QUICK_START.md). Inside the app, the searchable workflow guide is at `/tutorial`, and the same guide appears in Business Workspace at `/workspace`.

## Guides

| Document | Read it to learn |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | How the system is built, which code owns each rule, and how to make a change safely |
| [Architecture decision](decisions/0001-installation-and-data-boundaries.md) | Why the modular monolith and separate customer installations are retained, with rollout and rollback gates |
| [Business flow](BUSINESS_FLOW.md) | How material and money move, who owns each handoff, and the end-to-end acceptance check |
| [Integrations](INTEGRATIONS.md) | CSV import, Tally export, and the webhook and e-Way Bill designs |
| [Desktop delivery](DESKTOP_DELIVERY.md) | Electron development, packaging and customer installation |
| [Installation, deployment and updates](ONE_CLICK_DELIVERY.md) | Windows installer, hosted commands, provider runner setup and recovery |
| [Weighbridge agent](WEIGHBRIDGE_AGENT_ARCHITECTURE.md) | Indicator protocols, receipt signing and label printing |
| [Maintenance runbook](MAINTENANCE_RUNBOOK.md) | Verifying changes, refreshing generated docs, backup and restore |
| [Test scenario catalogue](TEST_PLAN.md) | Functional, boundary and negative test cases by module |
| [Operating guide](wiki/OPERATING_GUIDE.md) | Day-to-day use of the staff application |
| [Engineering agent system](../agent-system/README.md) | Repository-local skills, operating rules and their validation limits |

## Status and planning

| Document | Read it to learn |
| --- | --- |
| [Project status](PROJECT_AUDIT.md) | Current findings, readiness by business flow, and the validation record |
| [Implementation backlog](IMPLEMENTATION_BACKLOG.md) | Open work packages, their acceptance criteria and the register IDs they close |
| [Shared issue register](audits/2026-10-11/issue-register.md) | Every individual defect, with severity, priority and the test to add |
| [15 October review](audits/2026-10-15/REPORT.md) | The latest code, flow and UI review, plus the repository clean-up |

## Product and business

| Document | Read it to learn |
| --- | --- |
| [Go-to-market](GO_TO_MARKET.md) | First customers, stakeholders, pilot shape and claims we must not make yet |
| [Commercial model](COMMERCIAL_MODEL.md) | Proposed plans, metering and licensing (not yet active) |
| [Gate pilot plan](GATE_PILOT_PLAN.md) | The cotton receipt-to-accounts pilot, step by step |
| [Cotton moisture research](COTTON_MOISTURE_RESEARCH.md) | Why moisture settlement follows each contract, with worked examples |
| [Long-term research](LONG_TERM_RESEARCH.md) | Primary-source findings, discovery plan and experiments |
| [Operations Map design](OPERATIONS_MAP_DESIGN.md) | The design brief behind the Command Center view |

## Generated references

Regenerate these with `npm run docs:generate`, `npm run audit:roadmap` and `npm run audit:surface`. Never edit them by hand.

The [Integrations operating guide](wiki/pages/Integrations.md) is the exception inside the page wiki: it is maintained by hand and preserved by the generator. Review its instructions against the screen and API when import behavior changes.

- [Page wiki](wiki/README.md): one page per screen, with its routes, controls and API calls.
- [UI controls](reference/UI_CONTROLS.md), [API handlers](reference/API.md), [workflow actions](reference/WORKFLOWS.md), [data models](reference/DATA_MODEL.md), [code index](reference/CODE_INDEX.md) and [coverage counts](reference/COVERAGE.md).
- [Project surface](reference/PROJECT_SURFACE.md): every authored source and configuration file.
- [Roadmap evidence](reference/ROADMAP_EVIDENCE.md): which planned source files exist.

## Dated evidence

`docs/audits/<date>/` holds point-in-time reviews. Keep those reports as historical evidence. The [shared issue register](audits/2026-10-11/issue-register.md) is the exception: its location reflects when the audit began, and its entries receive dated resolution updates. Use the [project status](PROJECT_AUDIT.md), current register entries and backlog for today's status; an older report does not reopen a resolved finding.

| Date | Contents |
| --- | --- |
| [2026-10-06](audits/2026-10-06/BUSINESS_FLOW_REVIEW.md) | Business-flow review and the [parity register](audits/2026-10-06/PARITY_REGISTER.md) for the merged source projects |
| [2026-10-11](audits/2026-10-11/REPORT.md) | Production-readiness audit, the shared issue register, and the [gate workflow audit](audits/2026-10-11/GATE_WORKFLOW_AUDIT.md) |
| [2026-10-15](audits/2026-10-15/REPORT.md) | Code, flow and UI review, documentation consolidation and repository clean-up |

## Keeping docs honest

- When a workflow changes, update its code, the in-app guide and its acceptance checks together.
- Describe what the code does today. Label anything proposed as proposed.
- Never infer readiness from a document's title or from a passing build.
