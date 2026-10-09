# EverGreen toward 2030

2030 is a product direction, not a certification or a claim that future features exist.

## Implemented in this iteration

- Searchable workflow documentation with direct screen navigation.
- Business workspace refresh controls, timestamps and explicit unavailable/stale states.
- API health derived from a health response; machine count derived from the real register.
- Searchable workspace directory and links to health and API documentation.
- Read-only setup diagnostics and corrected setup/service documentation.
- API explorer server selection for the public proxy and direct API.

## Next release gates

| Priority | Outcome | Evidence required |
| --- | --- | --- |
| 1 | One consistent stock ledger across mill and commerce | End-to-end quantity reconciliation, rollback and duplicate-request tests |
| 2 | Recoverable operations | Online backup, restore drill and migration rollback evidence |
| 3 | Complete API contracts and access control | DTO coverage, role tests and documented responses on every write route |
| 4 | Accessible workflows across devices | Keyboard and screen-reader checks, narrow-screen checks and usable error recovery |
| 5 | Useful automation | Approval rules, audit history, idempotency and exception handling |
| 6 | Connected telemetry and forecasting | Actual device/provider integrations, source timestamps and measured forecast error |

Automation should build on reconciled records. Forecasting and live machine status must disclose their data source and freshness. Offline writes, multi-site synchronization, predictive maintenance and external compliance integrations remain roadmap work until implemented and validated.
