# EverGreen engineering agent system

Version 1.0.0. Repository-local, reviewable agent artifacts for building and maintaining EverGreen. This is a skill library and executable policy/evaluation scaffold, not a deployed autonomous service. No global skills or configuration are modified.

## Start here

1. Load [CONTEXT.md](CONTEXT.md) and [SYSTEM_PROMPT.md](SYSTEM_PROMPT.md).
2. Use [skills/index.md](skills/index.md) to select only the skills relevant to the requested change. Each skill has a `SKILL.md` entrypoint. Their shared operating contract lives in the system prompt.
3. Review [taxonomy.md](taxonomy.md) for all 310 concern decisions and [domains.md](domains.md) for domain-to-skill coverage. Applicability is a target requirement, not a statement of implementation.
4. Follow [WORKFLOW.md](WORKFLOW.md), record decisions using [memory.schema.json](memory.schema.json), and use [ROADMAP.md](ROADMAP.md) for sequencing.
5. Run `node --test agent-system/runtime/planner.test.mjs` and `node agent-system/validate.mjs`. Use [evals/scenarios.json](evals/scenarios.json) for behavioral review; structural and policy tests do not prove model behavior.

## Runtime boundary

`runtime/planner.mjs` implements deterministic skill routing and approval decisions for a host to use. `tools.json` defines proposed host function contracts. Actual shell/browser/deployment adapters, authentication, durable approval storage, secret storage and model invocation are **not implemented** here. A host must enforce the schemas, workspace boundary, redaction, artifact-bound approvals and tool capabilities before enabling execution. Do not expose arbitrary shell access through these proposed tools.

Use the existing coding-agent host to read skills and perform authorized repository work today. To install skills in a globally discoverable location, copy only selected skill folders through an explicitly authorized installation task and preserve the system contract. This change does not install them globally.

## Maintenance

The authored catalogue is in `catalog.mjs`; `node agent-system/generate.mjs` regenerates skill cards and coverage tables. Edit the catalogue first. Skill version changes accompany changed behavior: patch for clarified guidance, minor for compatible capabilities, major for changed approvals or tool contracts. Record real failures in redacted memory, reproduce them with a scenario, update the narrowest relevant skill, and rerun policy plus behavioral evaluations before adoption.

## Self-audit

- Merged repeated concerns (transactions, logging, configuration, feature flags) into shared skills while retaining each taxonomy ID.
- Kept legal applicability and statutory interpretation with the business owner/adviser; the agent can collect evidence and implement approved requirements.
- Added tenant isolation and desktop/hosted consistency gates because the chosen target includes all three scales and both platforms.
- Security review happens before merge/release, not only after code is merged.
- Chose measured demand baselines over claiming AI; ML is optional and needs a separate approved use case and evaluation.
- No production-readiness claim follows from a green build or these generated artifacts. Operational acceptance, restore drills, role checks, tenant tests and release acceptance remain necessary.

Open constraints and current limitations are explicit in CONTEXT.md. Delegation is optional and requires task authorization; this system does not spawn agents automatically.
