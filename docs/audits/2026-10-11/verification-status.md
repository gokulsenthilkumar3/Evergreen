# Verification status and source freshness

Audit source/configuration review began 11 October 2026 and final reporting continued after midnight into 12 October Asia/Kolkata. Initial HEAD was e6d4e69 with pre-existing local edits; later HEAD was 17e153f. Other work changed application source during the audit. The audit itself wrote only this documentation/evidence directory and temporary isolated test-analysis material. It did not patch, stage, commit or deploy application changes, modify production databases, or install/upgrade dependencies.

## Final focused rechecks

| Check | Final result | Evidence |
| --- | --- | --- |
| Tenant API Jest after production source changed | PASS: 16 suites, 146 tests, 36.904 s | api-unit-final.log |
| Provider API Jest after guard tests/source changed | PASS: 3 suites, 11 tests, 1.606 s | admin-recheck.log |
| Tenant Vite production build after shell changed | PASS: 2m25s; largest chunks OrbitControls 893.63 kB and entry 785.42 kB; gzip 242.57/245.46 kB | tenant-build-final.log |
| Provider Vite production build after authFetch added | PASS: 3.88s; JS 294.48 kB, gzip 86.56 kB | provider-build-final.log |
| Provider forged localhost Origin without key | REJECTED 401 by final guard | final-reproductions.json |
| Original weight-parser failures | Corrected: 100lb → 45.36kg; 1000g → 1kg; negative weight and ERR42 rejected | final-reproductions.json |
| Remaining weight/moisture malformed inputs | FAIL: unsupported oz/xyz and trailing garbage accepted; 12garbage accepted as moisture | final-reproductions.json |
| Slip altered finalBillableKg | Rejected after external change | final-reproductions.json |
| Slip altered excess/seal and expired valid signed event | Still accepted; replay/freshness policy absent | final-reproductions.json |
| Full real HTTP suite | BLOCKED: Prisma schema-engine failure in setup on initial and repeated run; requests never executed | api-http.log; api-http-retry.log |
| Migration SQL versus schema | FAIL parity: missing tenant/provider fields/table | reproductions.json; migration-register.md |
| Root dependency scan | 50 affected packages: 5 critical, 9 high, 36 moderate | dependency-audit-network.log |
| Desktop backend dependency scan | 61 affected packages: 2 critical, 43 high, 14 moderate, 2 low | desktop-dependency-audit.log |

The first provider build command attempted a nonexistent package-local Vite path; the retry using installed root Vite passed. That command-resolution failure is not itself a product defect. Builds used the existing installed dependency tree, not a fresh npm ci or production Docker build.

Initial no-emit TypeScript checks passed for tenant API, provider API, tenant web and provider web. Initial frontend tests were 179 tenant and 4 provider tests passing. Coverage was measured on initial source: tenant API 14.39% statements/9.9% branches; tenant web 18.4% statements/59.31% branches. Those results are not blanket certification of code that changed afterward. Only the final focused checks above were repeated when new source evidence justified them.

No live API server was deliberately started against the existing tenant/provider database because startup reconciliation/migration could mutate it. In-memory SQL replay and temporary test databases were used where possible. No Docker deployment, live cloud operation, real banking/GST/Tally transaction, serial device, printer, two-customer fleet or production backup restore was executed.

The initial manifest records source SHA-256 values; source-final-manifest.json records final values for the same inventory. Added test files are represented by final test output even if absent from the initial inventory. These manifests identify snapshot changes; they do not make the concurrent checkout immutable. Freeze the intended release revision and rerun all gates before shipping.
