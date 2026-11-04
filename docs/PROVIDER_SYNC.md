# Company-bound usage sync

Provider metrics transport is optional. Configure the customer API with `ADMIN_API_URL` (HTTPS outside loopback development), `COMPANY_ID`, and `ADMIN_SYNC_KEY`. Use the API key issued for that exact provider company; do not distribute the provider operator key to customers. The sender uses `X-Company-Key`, rejects redirects and has a ten-second response deadline.

For Docker set `EVERGREEN_ADMIN_API_URL`, `EVERGREEN_COMPANY_ID` and `EVERGREEN_ADMIN_SYNC_KEY` in the protected installation environment. Compose maps them to the API variables. Empty values keep transport disabled. Keep URLs and keys out of Git, command output and reports. Provision or rotate a company key through authenticated provider administration, then update that customer's protected environment and restart its API.

The provider guard binds a company key to `POST /companies/:id/sync` and its v1 counterpart. It rejects another company's URL and provider-console operations. Operator authentication still uses the separate provider credential/session. The provider must have its own operator credential configured before protected access is enabled.

Lifetime inward, outward and invoice counts remain reporting metrics. `billingPeriod` identifies the current UTC calendar month; `periodDocsPosted` counts inward, outward and invoice documents with posting dates in that month. The provider validates the month/count pair and stores this monthly value in `docsPosted`. Repeating a payload overwrites the snapshot rather than incrementing it. Legacy payloads without monthly fields update lifetime metrics without treating them as monthly usage. These counters do not measure all workflow documents, bale quantities or machine use, and are not a signed billing ledger.

This transport is separate from device-proof installation lease renewal. It does not issue a signed installation licence, synchronize databases bidirectionally, or resolve offline conflicts.
