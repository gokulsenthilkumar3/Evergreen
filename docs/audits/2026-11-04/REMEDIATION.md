# Review remediation in progress

Scope: implement the confirmed findings from GRAPHIFY_REVIEW.md while preserving the existing staged Graphify setup, supplied review files and provider UI edits. No live database migration, deployment or remote Git policy change is authorized by this development task.

Implemented so far (verification ongoing):

- Explicit configured proxy addresses in the tenant API and Docker recipe; reject blanket proxy trust. New Express request tests cover distinct clients and spoofed forwarding headers.
- Coalesce session activity writes using conditional database updates while keeping per-request revocation, user and policy reads. New session tests passed with the proxy tests: 6 tests.
- Add transactional per-financial-year invoice numbering, an additive SQLite migration and rejection of client-assigned numbers. Real disposable SQLite tests cover IST rollover, sequence adoption, rollback and exhaustion.
- Scope finance projection to mutated source IDs and lot checks to touched items; retain full startup/repair/bulk and legacy reconciliation. Finance projection equivalence and no-historical-read tests added. Latest focused run: 48 tests passed; tenant API typecheck passed.
- Lazy-load the Tamil dictionary and preserve synchronous ready-state translation behavior; test setup preloads it only for tests. Production tests/build remain pending.
- Correct main marketing counters/feature claims. Illustrative case studies and product tour still require cleanup.
- Add company-bound sync credentials and explicit current-month billing counters, preserving lifetime metrics separately. Sync and provider tests are running; configuration documentation remains pending.
- Updated production-advisory packages within existing ranges. Initial audit was 1 critical, 5 high and 2 moderate; update completed, post-update audit still required.

Remaining implementation/verification:

- Finish source-scoped reconciliation tests/full API tests; legacy mutations and closed-period snapshots still retain the conservative full path.
- Complete sync tests, company-key binding and billing-month validation, deployment setup docs.
- Add exact-decimal PostgreSQL runtime/migration support and test on a disposable PostgreSQL instance. Keep SQLite compatibility and require a separate approved operational cutover.
- Enforce browser/server package boundaries.
- Finish truthful marketing scenarios and locale behavior tests/build measurement.
- Regenerate 43 stale docs and remaining audit/generated references; update status with verified results.
- Run appropriate broad checks, refresh Graphify after source changes, run commit impact check before any commit. Preserve staging choices and do not commit/push without a task requirement.

Active tool sessions when this note was written: dependency update completed; Docker Desktop start completed; sync/provider test command is running. The owner expects code fixes, not another review-only response.
