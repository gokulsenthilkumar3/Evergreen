# Findings corrected, narrowed, or withdrawn during review

- **SEC-001:** initial unauthenticated Origin bypass reproduced. Externally changed guard now rejects the same forged origin with HTTP 401. Final provider unit tests: 11/11. Deployment status unverified; shared-key identity remains SEC-003.
- **SEC-007:** tenant App token links removed externally; diagnostic HTML still creates token-bearing Studio link. Finding narrowed to remaining code.
- **UI-001:** external authFetch adds Authorization but distributes the provider master key through browser storage/build environment and fallback. Finding rewritten, not marked secure.
- **BIZ-008:** original lb/g/negative/ERR cases now pass; unsupported units, trailing garbage and malformed moisture still reproduce.
- **BIZ-009:** altered finalBillableKg is rejected after external update; altered excess percentage/seal and expired event are still accepted.
- **BIZ-003 (withdrawn):** suspected missing fulfilment-to-order link is not supported. createInvoice normalizes body.salesOrderId inside its salesOrder branch before persistence, so the reported missing-link theory was wrong. Retain a journey test; no fix is recommended for that theory.
- **Production:** external edit adds CREATE ActivityLog and changes balance test to symmetric 2% tolerance. Do not report production CREATE as unaudited; current mass-conservation risk is BIZ-015.
- **Provider build:** external prebuild now generates admin Prisma. Earlier tenant-generation coupling is withdrawn; missing root config/script and PDF install context remain.
- **Evidence freshness:** initial HEAD e6d4e69; later HEAD 17e153f. Original inventory and final SHA-256 manifest distinguish changed files. Test/build results identify initial versus final runs. No claim is made that an earlier result certifies a later source revision.
