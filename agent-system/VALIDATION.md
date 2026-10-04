# Validation evidence

Validation performed on 2026-10-04 for this repository-local iteration:

| Check | Result |
| --- | --- |
| Web production build | Passed; Vite reports existing large chunks above 500 kB |
| Web TypeScript check after component/test updates | Passed |
| API TypeScript check | Passed |
| Web regression tests | 16 passed, including unavailable data, stale values and guide navigation/search |
| API tests | 51 passed across 10 suites; obsolete root test replaced with health representation contracts |
| Agent policy tests | 8 passed, including expired/mismatched approvals and unknown-action denial |
| Agent artifact validation | 21 cards, 310 mappings, local links and 10 scenario definitions checked |
| Setup diagnostics | Passed without printing secrets or modifying the database |
| Running health JSON | HTTP 200; service evergreen-api; status ok |

## Limits

- No connected browser was available; visual, responsive, keyboard and screen-reader QA remain unverified.
- The 10 model-behavior scenarios are authored, not executed. Passing policy tests does not prove an LLM will follow the cards.
- The bundled Python skill validator could not run because Python was unavailable. The repository Node validator checked card identity, references and coverage instead; it is not an equivalent full skill validator.
- No live financial transaction, operational migration, backup/restore drill, tenant rollout, desktop installer or hosted release was performed.
- API source changes require the running API process to be rebuilt/restarted before the existing server serves them. The health probe confirms the running service, not deployment of this patch.
- Existing staged health/dashboard/Studio work was preserved. Its unrelated whitespace warnings were not treated as this iteration's changes.

See README.md for the unimplemented host adapter and approval-storage boundary.
