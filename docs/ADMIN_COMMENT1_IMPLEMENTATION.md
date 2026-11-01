# Comment 1 implementation — 1 November 2026

The original redesign document is preserved. This records the actual changes against its appended Comment 1.

| Finding | Implemented behaviour |
| --- | --- |
| F1 | Persisted, version-bound observations can confirm endpoint reachability. A shared proof clock expires evidence. Owner-signed approval uses Ed25519 verification and an expiring, replay-checked record digest. Every confirmation states its scope; reachability and operator approval do not confirm deployment, payment or delivery execution. |
| F2 | `/control/proof` uses sequence cursors, validated limits, entity/time filters and a load-older UI. All legacy control audits are imported without the old 250-row ceiling. Release job transitions observed after this change are appended. Pre-existing unrecorded intermediate states cannot be reconstructed. |
| F3 | SHA-256 links and SQLite UPDATE/DELETE rejection triggers protect an append-only ledger. Verify-chain scans in bounded batches. There is no external checkpoint; a privileged full database-and-chain rewrite is outside this guarantee. |
| F4 | Explorer exposes approved payload fields under owner runtime policy, redacts URL credentials/query strings, limits child projections, and previews field names without values. Arbitrary payload properties and named secret fields are excluded. Free-text fields still require owner care. |
| F5 | Replay, rollback, backup, restore-drill and six provisioning-step requests are persisted, deduplicated and appended to the ledger. Without an executor they stay requested. Connector and topology probes use an operator-owned target allowlist. They never fetch browser-supplied targets or forward the provider root key. Actual cloud executors, scheduled workers, backup agents and durable cross-customer telemetry collection remain separate integrations. |
| F6 | Command palette debounces authenticated server search across companies, control records and release versions/IDs, timestamps results, and loads selected record details. |
| F7/F12 | Canvas 2D perspective projection replaces the CSS-only scene. Deterministic scene geometry, bounded pixel ratio, 30fps rendering, offscreen/visibility pausing, reduced-motion static portraits, and CSS fallback are implemented. |
| F8 | Explorer returns HTTP 200. |
| F9 | Explorer is limited to 10 calls per minute per server-owned operator identity. Search/probes/requests/chain checks have separate limits. Limits are in-process; multi-instance deployments need shared enforcement. |
| F10 | Six Playwright tests cover three themes, five scene variants, evidence-only confirmation/expiry and navigation timing. Screenshot baselines use synthetic fixtures, never private company data. Windows CI checks diffs with a 2% pixel budget. |
| F11 | The environment pill polls authenticated live host/database identity and latency. Responses include opaque instance and DB fingerprint headers. Missing polls become visible stale/unavailable states. |

## Owner configuration

Payload projection is enabled only when the server has `EVERGREEN_EXPLORER_PAYLOAD=true`; the local owner run was started with that policy enabled. This is owner policy, not delegated RBAC. Clients cannot grant themselves payload access.

Configure approved reachability targets on the server with `EVERGREEN_PROBE_TARGETS`, for example:

```json
{"REAL_RECORD_OR_COMPANY_ID":{"url":"https://approved-host.example/health"}}
```

Only HTTPS is allowed except explicit loopback HTTP for development. Credentials, queries, fragments and redirects are rejected. An HTTP observation proves only the labelled reachability check. Existing customer API monitoring credentials remain separate.

To attest an individual control record, open its inspector Proof tab, use the displayed digest with `scripts/security/owner-attest.cjs` in your own owner terminal, and submit the public signed approval. Private signing material is not returned to the browser or transferred to cloud hosts. The approval is record-version-bound and cannot be replayed. It does not represent external execution.

## Data migration and validation

An additive migration created AuditLedger, EvidenceObservation and OperationRequest. A verified snapshot and checksum/count manifest were created first in the private owner database directory; original data was retained. No existing business rows were deleted.

Backend integration tests use a disposable database and a local fixture HTTP server. They cover chain integrity, immutable triggers, pagination, real observation, expiry, version invalidation, idempotent requests, projections and rate limiting. Browser fixtures intercept API calls and use a development-only scene harness; that harness is disabled in production builds. Current key custody and installation authentication remain enforced.

## Remaining boundaries

The supplemental full motion catalogue is not all implemented: there is no global text scramble, magnetic controls, full-screen noise wipe or fake sparkline data. Existing state transitions, canvas scenes, aurora, hover depth and reduced-motion behaviour are retained. Durable telemetry aggregates/percentiles, independent customer execution attestation, distributed queues, delegated roles and external audit anchoring still need their actual service implementations. Request buttons do not silently execute those missing services.
