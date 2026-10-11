# EverGreen OS — production readiness audit

**Decision: do not approve a production release on the evidence available.** The application contains substantive accounting and inventory logic, but the provider plane still mixes real control records with simulated operational outcomes, clean migrations do not produce the schemas the applications require, and several authentication, licensing, integration and recovery requirements are unmet.

Audit dates: **11–12 October 2026, Asia/Kolkata**. Workspace: `D:\Projects\EverGreen`. Initial commit: `e6d4e69`; later commit observed: `17e153f`. This was a **report-only audit**. No application patches, refactors, production database writes, external messages, cloud operations, dependency upgrades or live device operations were performed by this audit.

The checkout changed externally while this work was in progress. Findings were narrowed or withdrawn where reinspection disproved them. Most notably, the original provider Origin/Host bypass is **no longer reproducible in the final inspected guard**. It remains documented as a historical finding, not an open bypass. See [dispositions](dispositions.md), [initial reproductions](reproductions.json), [final reproductions](final-reproductions.json), and [final source manifest](source-final-manifest.json). Deploying a correction elsewhere was not verified.

This report covers every requested **layer** and inventories the source-level routes, screens, models, migrations and environment references. It does **not** certify every route or screen through live execution. Failed HTTP setup, unavailable external accounts/devices, absent production snapshots and changing source prevent that claim. Each limitation is an acceptance requirement, not an assumed pass.

## 1. Executive summary — ten highest-risk issue groups

| Rank | Issue group | Why release is blocked | References |
| --- | --- | --- | --- |
| 1 | Custom Database Studio bypasses application data and MFA boundaries | Any authenticated tenant role can read every table and submit raw SQL. Separate password-only login creates seven-day tenant sessions without TOTP. The server binds all interfaces. These are source-confirmed capabilities; destructive queries were not executed. | SEC-019–022 |
| 2 | Provider master credentials reach browser code and have known deployment defaults | Final provider UI sends a shared master key obtained from localStorage/build environment with a committed fallback. Compose defaults remain known. Named-user provider authentication, MFA and role separation are absent. Removing the earlier Origin bypass does not resolve this design. | SEC-002–004, UI-001 |
| 3 | Both migration chains drift from the current Prisma models | Empty SQLite replay leaves 14 tenant settings fields, 15 provider Company fields and the entire RemoteAction table missing. A clean deployed database cannot satisfy the current application. | DB-001–002 |
| 4 | Provider operations and agent paths fabricate results | Demo tenants/records, random ping latency, canned terminal/AI/backup responses and simulated CI/CD success are in normal paths. The weighbridge start command launches simulation. | UI-002–003, INT-006, INT-008 |
| 5 | Fleet identity and remote-action trust are incomplete | Shared provider authority is not bound to a specific tenant for metrics; arbitrary additional metrics are accepted. Remote actions record completion without signed tenant execution acknowledgment. Physical two-tenant isolation is not proven. | API-004/006, SEP-002/004 |
| 6 | Financial and material conservation differ across paths | Order-amendment tax rounding differs from canonical invoicing; discount allocation lacks residual reconciliation; money uses Float; final production logic permits a symmetric 2% mass difference. | DB-004, BIZ-001–002/015 |
| 7 | Licensing is not enforced comprehensively at API boundaries | Direct API callers can bypass UI suspension/module restrictions; user, machine and document quota semantics are inconsistent; expiry processing can override suspension. | BIZ-005–007 |
| 8 | Current registry audits report critical/high dependencies | Root tree: 50 affected packages, including 5 critical and 9 high. Packaged desktop backend: 61, including 2 critical and 43 high. Counts overlap and are not unique CVEs. CI does not block on audit failure. | DEP-001–111, TEST-005/007 |
| 9 | Deployment and recovery are not dependable | Docker recipes reference absent configuration/scripts, entrypoints swallow migration failure, and HTTP migration execution lacks safe orchestration. No real automated backup/restore or RPO/RTO drill is demonstrated. | REL-001–005, API-005, DB-009 |
| 10 | Browser session and content boundaries expose credentials | Tenant JWTs are stored in localStorage; diagnostic HTML still creates token-bearing Studio URLs; label print HTML interpolates unescaped code. The latter is a source-confirmed injection sink, not an executed browser exploit. | SEC-006–008 |

Historical critical issue **SEC-001** was corrected externally during the audit and passed a final isolated rejection test. Do not use the initial successful bypass reproduction to describe the final guard as still vulnerable to the same request.

## 2. Full issue register

The complete register is delivered in three formats:

- [Full 13-column issue table](issue-register.md).
- [Filterable CSV](issue-register.csv).
- [Structured JSON](issue-register.json).

There are **223 entries**: **112 application/control/assurance entries**, including one corrected historical finding, and **111 affected dependency-package entries** across the workspace and desktop backend. Accordingly, there are **111 open application/control/assurance findings** in this register. Dependency records may share advisories; do not interpret the dependency count as distinct vulnerabilities or proven exploits.

Every row contains the requested ID, layer, title, description, evidence, impact, likelihood, severity, priority, architected fix, effort, dependencies and proposed test. Issue IDs are stable; `BIZ-003` was deliberately withdrawn after tracing a normalization branch that correctly persists the sales-order link. Its ID is not reassigned.

Priority totals including the historical entry: P0 **53**, P1 **105**, P2 **60**, P3 **5**. No P4–P7 defect was invented to populate a category. Efforts are engineering person-days, often overlap in shared platform work, and exclude external vendor approval, tax/legal review and hardware procurement. They must not be summed into an unqualified calendar estimate.

Evidence labels:

- **REPRODUCED / MEASURED:** isolated execution or tool output directly supports the stated behavior.
- **STATIC:** a concrete source/configuration path supports the finding; deployment reachability or exploitation may remain unverified.
- **GAP / UNVERIFIED:** evidence or implementation required for acceptance is missing. This is not proof that a deployed environment necessarily lacks an externally managed control.
- **RESOLVED / WITHDRAWN:** explicitly identified in the disposition record and not represented as an open implementation defect.

## 3. Layer-by-layer findings and verification evidence

### Database layer

**Inventory:** 53 tenant models and 6 provider models. The [schema register](schema-register.md) lists every model with field count, declared keys/indexes, relations and Float fields. [Migration register](migration-register.md) covers all 21 registered tenant migrations, 3 provider migrations and 1 manual SQL file.

Both active Prisma schemas declare SQLite. PostgreSQL is an architectural target, not a verified alternative obtained by replacing `DATABASE_URL`. PostgreSQL syntax, enum/check behavior, numeric semantics, isolation, locking and migrations are **UNVERIFIED / not implemented in the reviewed migration profiles**. Redis in environment examples is not evidence of a working cache/queue deployment.

Migration SQL was replayed in **empty in-memory SQLite** databases without touching tenant data. All registered SQL scripts applied, but the resulting schemas differ from current Prisma declarations:

- Tenant `SystemSettings`: `plan`, `pricingModel`, `status`, `licenseExpiresAt`, `gracePeriodDays`, `graceExpiresAt`, `maxUsers`, `maxMachines`, `maxDocsPerMonth`, `allowedModules`, `tier`, `state`, `country`, `isMaintenance` are missing.
- Provider `Company`: `tier`, `state`, `country`, `pricingModel`, `licenseKey`, `validFrom`, `expiresAt`, `gracePeriodDays`, `graceExpiresAt`, `maxUsers`, `maxMachines`, `maxDocsPerMonth`, `allowedModules`, `isMaintenance`, `lastMigrationStatus` are missing.
- Provider `RemoteAction`: the table and its seven declared scalar columns are missing.

An empty `foreign_key_check` result proves only that these empty replay databases had no orphan rows. It says nothing about real customer data. Live orphan counts, duplicate keys, database integrity, historical rounding differences, inventory valuation and ledger reconciliation remain **UNVERIFIED**.

Missing relationships include concrete batch/catalogue/production/warehouse/QC links and workflow/WIP/stock-hold scalar references; provider control records/audits also lack some concrete referential links. Polymorphic references require a deliberate integrity design rather than blindly adding a foreign key to every ID-like field. The issue register requires pre-migration orphan inventory and an explicit policy for each link.

Existing stock-movement and customer-ledger composite indexes are useful. Remaining query-driven candidates include inward/production dates, invoices by customer/status/date and source, payments by invoice/date, sessions by user/validity/activity, journal lines by entry, audit logs by date, warehouse movements by item and provider actions by company. These are **candidates to validate with plans**, not measured “slow indexes.” Actual p95/p99 query latency was not obtained.

Financial amounts across invoices, payments, journals, costing and payroll use floating-point storage. Status/type strings and several sign/uniqueness invariants rely on service validation. Cascades can remove financial or action history if protected parents are deleted directly or through future code. Existing HTTP deletion guards reduce some exposure and must not be ignored.

Historical migrations rebuild tables, turn off foreign-key enforcement and rewrite selected defaults/authorship. No paired rollback SQL was found. A reversible down migration is not inherently the right solution to every financial schema change; the requirement is a tested restore/forward-repair procedure, reviewed data transfer, compatibility window and interruption recovery. None was demonstrated.

Sensitive values are not protected by active field-level encryption; the AES helper is unused and contains a fallback secret. Whole-disk/cloud backup encryption and key permissions are **UNVERIFIED**. Separate application clients/env names are positive source evidence of plane separation; actual database ownership and customer provisioning are evaluated separately below.

### Backend API layer

The [route register](route-register.md) enumerates **162 Nest controller handler declarations**: 142 tenant and 20 provider. It records method, path, handler/source, declared role, local guard, body declaration and runtime verification status. The [custom Studio register](studio-route-register.md) adds **9 separately implemented route paths plus wildcard OPTIONS**, outside Nest protection. A handler carrying multiple HTTP verb decorators is not assumed to create multiple working routes; actual registration needs a booted-server test.

Tenant authentication has meaningful controls: global JWT/session enforcement, role hierarchy checks, current database role lookup, server-side logout/session revocation, safe user projections, and last-administrator protection. Selected DTOs use class validation and the global pipe enables transform/whitelist/forbid. These controls are **not absent**, but they do not make every endpoint safe.

The final provider guard checks a shared credential using hashed constant-time comparison and rejects its development fallback in production. It still derives audit actor from a caller header and does not implement user-specific roles, MFA or session revocation. `@Public()` metadata in provider controllers is not itself evidence of bypass: the actual provider guard hardcodes its GET root/health exceptions.

Module review:

| Domain/modules | What was traced | Findings and remaining proof |
| --- | --- | --- |
| Auth, users, sessions | Bootstrap, bcrypt/legacy login, JWT/session lookup, logout, password reset/change, TOTP, passkeys, role projection | SEC-006/009–012/014; correct existing revocation/role controls acknowledged. JWT has one-day expiry; no full refresh lifecycle. Passkey production origin and composed factors fail design review. |
| Settings and licensing sync | Read/write projection, singleton creation, admin-only allowlist, hourly sync/status/quotas | API-003/006, BIZ-005–007, SEP-001–002; singleton/quota races and provider data visibility. |
| Inventory, inward, warehouse, jobwork | Receipt quantities, movements, stock guards, merges, dispatch/receive, reversals, QC links | DB-005/006/010, API-008/012, BIZ-008–010/015; complete physical-device and concurrent HTTP flow remains unverified. SYSTEM_MERGE bookkeeping is not labeled mock data merely because it is synthetic accounting. |
| Production and WIP | Input/output sums, bag conversion, date/stock checks, WIP creation/completion, process cost and loss journals | Final source adds production CREATE audit; symmetric 2% tolerance and implicit loss need BIZ-015 review. WIP completion has explicit loss logic, unlike treating every loss category as absent. |
| Commerce, storefront and billing | Catalogue, customer, orders, dispatch-linked invoices, receipts, payment reversal, void, verification, public orders | API-001/008–011, BIZ-001–004/011–013. BIZ-003 missing-link theory withdrawn. Legacy billing mutations are intentionally guarded/read-only. |
| Workflows and finance | Posting/void transactions, request keys, returns, supplier payments, allocations, closed periods and journal reconciliation | Substantial transactional validation exists; remaining risks include duplicate calculation policy, generic contracts, broad replay cost and missing live journey proof. |
| HR, machines, quality, costing | DTOs, staff/payroll data, capacity checks, inspection/hold linkage, expense derivation | SEC-014, API-010, BIZ-007/014, DB-005/006. Payroll net arithmetic exists; bank settlement and statutory completeness are not proven. |
| Dashboard, logs, search | Daily summary query/schedule, bounded search, audit list and diagnostics | INT-010, SEC-013/016, PERF-001. Audit list cap without continuation is not pagination. Swallowed search failures can look empty. |
| Provider companies/control/CI-CD | Company/metrics/license mutation, remote action state, control record validation/versioning/audits, release/deploy services | API-002/004, INT-008, UI-002–005. Control service transactions/version checks and completion evidence fields are positive; simulated CI/CD does not execute those claims. |
| Integrations and admin operations | Tally XML, integration status, SMTP/collections, migration execution | INT-001–010, API-005. No actual gateway/IRP/cloud lifecycle was verified. |
| Custom Database Studio and launchers | Separate Node HTTP login, shared JWT/session verifier, all-table listing, raw SQL, cookie/CORS/body/bind behavior | SEC-019–022. Nest guards/DTOs/Helmet/rate limits do not protect this service. Operator shell is separately rendered HTML, not in the TSX screen count. |

Raw `any` or inline TypeScript shapes do not create runtime DTO metadata. Manual validation exists in several services, including financial amount/date checks and stock guards, but is incomplete as a uniform API contract. Strict route/query parsing, unknown-field rejection and typed response/error contracts are missing in enough places to require an endpoint-wide plan.

Examples of smaller contract defects retained in the register: `false` becomes `null` in customer update; zero costing values are dropped by truthy checks; category may be overwritten by spread input; parsing can accept numeric prefixes; ordinary `Error` paths can become internal 500s; response shapes vary; duplicate-route decorator intent is ambiguous. They are not excused by the larger architecture issues.

Financial transactions are **not universally absent**. `stockTransaction`, workflow posting, payment updates and role changes contain meaningful atomic work. Remaining concerns are inconsistent idempotency, nonunique payment reference semantics, out-of-transaction count checks, nontransactional provider remote actions and full-history reconciliation inside critical mutations. Independent transactions cannot be declared serializable under every deployment solely from source.

No active general binary upload controller was found in the reviewed Nest route inventory. PDF/barcode generation and client-side spreadsheet import are present. Consequently, MIME sniffing, virus scanning, object-store quarantine and upload-path traversal are **not verified capabilities**; they must become explicit gates if file ingestion is shipped. Existing Nest 1 MB JSON body limits are useful but do not protect custom Studio, which accumulates unbounded request bodies. **Studio deliberately passes user SQL to `$queryRawUnsafe` without role/read-only policy.** This is an unrestricted capability bypass, not a claim that an allowlisted table/sort parameter was exploited. No destructive SQL was executed. The fixed migration shell command is an operational orchestration risk, not a proven command-injection exploit.

### Frontend layer

The [screen register](screen-register.md) inventories **123 TSX screens/components**, network declarations, role hints, adjacent test hints, import reachability and runtime status. Every row is explicitly **UNVERIFIED for live role/data/device journeys**. Static presence, a lazy import and a mocked component test are different kinds of evidence.

Tenant React has lazy routes, React Query, error boundaries and centralized unauthorized handling. A 401 outside sign-in clears local credentials and reloads. These are useful behaviors. Nevertheless, the authoritative user/role is not refreshed at initial shell load; navigation filters are not render guards; protected forms do not consistently hide/disable actions by capability; broad mutation invalidation triggers excess refetches and no common request timeout bounds outages.

Provider frontend now attaches a bearer through `authFetch`, added outside this audit. This is **not a secure login system**: the key comes from localStorage or a Vite environment value with a fallback. Putting a provider master key in `VITE_ADMIN_API_KEY` makes it client material. The current audit does not print its value. Fake operational data and success responses remain separate defects.

Book-Ellam has five populated mappings for the six-register promise; DAYBOOK is missing. Machine rows use mismatched production property names and fixed labels, ledger rows are customer balances rather than events, and stock rows are incomplete. Cross-register totals/search/date behavior therefore cannot be treated as correct even if the table renders. Date precedence and swallowed errors add separate correctness failures.

The linear barcode is a visual pattern, not Code128. QR rendering uses a real library, but live scanner/printed-label compatibility was not tested. Raw title interpolation in print HTML and CSV formula/escaping problems are separate security defects.

English/Tamil coverage is partial and Hindi is absent. Hardcoded labels remain across both planes. One language toggle attempts an administrator settings update and promises a retry that does not exist. Currency and date formatting are inconsistent across legacy/current paths; the accepted precision contract must be enforced centrally, not only through input formatting. Some primary components have skeletons/empty states, but no universal completeness claim can be made across all screens.

The 3D Command Center has real reduced-motion, visibility pause, DPR limiting, cleanup and fallback code; a blanket “memory leak” accusation would be unsupported. Actual GPU memory/context-loss behavior, long-session leaks, low-end hardware responsiveness and accessibility remain **UNVERIFIED**. Primary visual/spec compliance, contrast and focus behavior were not certified through rendered manual acceptance. A historical design document is not treated as a current approved visual specification without an owner.

### Integrations and webhooks

| Integration | Actual implementation evidence | End-to-end result / missing controls |
| --- | --- | --- |
| Tally | Real XML construction, XML escaping, ADMIN route, Purchase explicitly rejected without approved bill mapping | No real Tally import run. Current export includes void/internal payment rows, fixed ledger names and no durable acknowledgment/reimport identity. Wrong date end bounds. INT-001/002. |
| GST IRP | No complete real adapter/lifecycle found | Authentication, IRN request/rejection/replay/cancellation and certified schemas **UNVERIFIED / missing**. INT-003/BIZ-011. |
| E-way bill | UI/local records are not a government-service workflow | Generation, extension, cancellation and Part-B **UNVERIFIED / missing**. INT-003. |
| Payment gateway | Manual invoice receipt logic exists; provider payment UI simulates verification | No complete signed webhook, inbox, idempotent gateway posting, retry/DLQ or settlement reconciliation. INT-004. |
| WhatsApp/SMS | `wa.me` collection-message composition | Not managed delivery. No approved templates/status/opt-out callback flow; SMS adapter absent. INT-005. |
| Weighbridge/moisture | Parser and HMAC helper; normal agent entry runs simulator | No real serial transport, reconnect, offline buffer or signed ingestion proof. Final parsers still accept malformed frames; slip replay remains. INT-006/BIZ-008/009. |
| Barcode printer | TSPL/ZPL string templates and browser labels | No certified driver/spool/delivery/reprint evidence; command escaping incomplete. INT-007/UI-010. |
| SMTP email | Actual nodemailer usage when configured | No delivery account test; sender/TLS/preferences/escaping/outbox/bounce recovery incomplete. INT-009. |
| Cloud deployment | Compose/Linux files and provider CI/CD UI/service | No verified GCP/AWS/Azure deployment calls/provisioning/rollback; provider outcomes simulated. INT-008/REL-008/010. |
| Provider telemetry | Hourly fetch and metric upsert | Wrong configured endpoint use, no per-tenant credential binding/signature/replay/durable delivery, unrestricted additionalMetrics. API-006/SEP-002. |

Tally returns import counts/error fields that must be interpreted; generating XML is not successful import. The recommended acceptance flow is grounded in [Tally’s official sample XML guidance](https://help.tallysolutions.com/sample-xml/). GST onboarding and payload requirements must be validated with the selected authorized provider and current [GST e-invoice API integration guidance](https://tutorial.gst.gov.in/downloads/news/e-invoice_api_integration_guide_irps.pdf). E-way authentication and operations require actual vendor/portal acceptance against the [official API overview](https://docs.ewaybillgst.gov.in/apidocs/api-overview.html) and [authentication documentation](https://docs.ewaybillgst.gov.in/apidocs/version1.01/authentication.html). This audit does not assert a tax rate, threshold or statutory applicability for an unknown mill.

No existing webhook was credited with signature, idempotency or retry verification merely because an integration label appears in the UI. For integrations not implemented, these controls are **missing requirements**, not “passed.” For telemetry, the producer/consumer path was traced and found incomplete.

### Security layer

Authentication, authorization, session handling, stored/browser secrets, transport, headers, input/output boundaries, rate limits, audit integrity, PII and dependencies were reviewed. Confirmed/remaining weaknesses are in SEC-002–018 and related layer entries. Password hashing uses bcrypt; selected safe output projections and session invalidation work at the source/test level. TOTP exists, while provider MFA does not. Tenant passkeys require a corrected production ceremony configuration.

Current source does not prove TLS everywhere, HSTS at the real edge, secure customer database permissions, external secret-store rotation or protected backup storage. Nginx/Compose examples expose HTTP/API surfaces; CSP permits inline execution in API-served content and diagnostic capabilities need redesign. Cookie CSRF defense must be designed if replacing bearer localStorage with cookie sessions; absence of that defense in a bearer-only path is not automatically a current exploitable CSRF finding. Custom Studio already accepts cookies and issues a non-Secure SameSite=Lax cookie; its entire separate transport/auth/CSRF policy requires review. Password-only Studio login ignores TOTP and creates sessions usable by the tenant verifier when the signing secret matches. Any role can access raw table data, including authentication fields.

Provider-to-tenant authorization is a distinct trust domain. A tenant JWT plus static provider header on migration is not a complete signed remote-action protocol. A tenant ID column is **not required** for every table when the deployment and database are isolated; its absence is not reported as a vulnerability.

Dependency results are fully enumerated in [dependency report](dependency-report.md), with advisory URLs, affected ranges, paths and registry fix metadata. All package records found in root, desktop and archived lockfiles are retained in [dependency inventory](dependency-inventory.json). Root/desktop live audit results do not cover every archived dependency, OS package, image layer or browser runtime binary. Those remain explicitly **UNVERIFIED** under TEST-007.

Root critical package records include `proxy-addr`, `handlebars`, `vitest`, `@vitest/coverage-v8` and `tinypool`. Tooling-server/worker prerequisites differ from server request-processing exposure; “critical dependency” does not mean proven unauthenticated runtime RCE in this application. Root XLSX advisories include prototype-pollution/ReDoS concerns and no straightforward npm fix in the audit metadata; see the advisory links and [NVD’s CVE-2024-22363 record](https://nvd.nist.gov/vuln/detail/CVE-2024-22363). The desktop tree has its own older dependencies and cannot inherit the root tree’s status.

Penetration-test focus after safe staging setup: provider credential/actor trust, tenant-bound telemetry and commands, role/field IDOR matrix, stale/revoked session handling, TOTP/passkey replay, stored print HTML, exported spreadsheet formulas, anonymous stock reservation abuse, proxy/rate-limit bypass, malformed nested financial inputs, sequential/concurrent idempotency, diagnostic leakage and artifact secrets. No destructive penetration test against live systems was performed.

### Performance and scalability

Concrete source risks include N+1 item/customer aggregate queries, unbounded nested lists and full-history reconciliation, session writes on each authenticated request, broad client invalidation and limited list continuation. Existing lazy loading and bounded search/list caps are acknowledged; a cap without pagination does not provide complete access to history.

Initial tenant production build measured approximately **894 kB** for the OrbitControls/Three chunk, **786 kB** for the entry chunk, **417 kB** for a PDF plugin, **325 kB** for a chart chunk, **286 kB** for export controls, **250 kB** for Command Center, and **201 kB** for html2canvas. These are emitted minified sizes, not real network transfer or user-perceived latency. Initial gzip entry was about **246 kB**. Final builds are separately recorded because source changed. Provider final build is about **294.48 kB JS / 86.56 kB gzip**.

No actual endpoint response-time threshold violation is asserted without a load measurement. 10x/100x behavior, SQLite lock saturation, memory growth, queue depth and provider cloud cost are **UNVERIFIED**. PERF-004 defines the necessary SLO/profile experiment; optimizing by query count alone or promising Redis scalability would not constitute verification.

### Reliability and operations

Docker build input mismatches, swallowed migration errors, broad build contexts, runtime dependency/permissions uncertainty, weak deployment defaults, unsafe proxy assumptions and incomplete VM provisioning are concrete configuration findings. The image builds themselves were not executed; no image registry/cloud deployment was authorized or needed for the read-only source audit.

Central structured logs, redaction, searchable retention, correlation IDs, traces, dependency metrics, operational alerts, real queue recovery and exercised incident runbooks are incomplete or not evidenced. Do not equate dashboards displaying inferred ONLINE state with monitoring. Health readiness must reflect dependency failure and cannot return success to the deployment orchestrator when required schema/DB access fails.

Backups, DR and zero-downtime migration acceptance remain blocked. RPO/RTO must be defined per service tier and demonstrated by a random tenant restore, reconciliation and recovery drill. Feature flags/license caches require signed versioned policy and server enforcement. API versioning, database migrations and immutable release tags/artifact digests need separate compatibility contracts; current CI/CD sample version labels are not release provenance.

### Testing layer — executed evidence

| Check | Outcome | Meaning and limit |
| --- | --- | --- |
| Tenant API initial Jest | 16 suites, 146 tests passed | Unit/component-service evidence; not full HTTP or DB isolation. [Log](api-unit.log). |
| Tenant API coverage run | Same 146 tests passed; statements 14.39%, branches 9.9%, functions 9.57%, lines 15.85% | Initial-source coverage, not a certification of subsequently changed production logic. [Log](api-coverage.log). |
| Tenant frontend Vitest | 20 files, 179 tests passed | Selected UI/utility tests with test fixtures/mocked network. [Log](web-unit.log). |
| Tenant frontend coverage | Statements/lines 18.4%; branches 59.31%; functions 38.32% | Instrumentation denominator differs by metric; high relative branch number does not override low statement coverage. [Log](web-coverage.log). |
| Provider API initial/final | Initially 2 suites/5 tests passed; final recheck 3 suites/11 tests passed | External guard regression tests added during audit. [Initial](admin-unit.log), [final](admin-recheck.log). |
| Provider frontend | 1 file/4 tests passed manually | No package test script wires these into normal workspace test invocation. [Log](admin-web-tests.log). |
| Tenant HTTP e2e | Five tests fail at Prisma migration setup; retry also fails | App/guards/journeys never exercised by that run. Native engine failure cause unresolved, not attributed automatically to schema drift. [Initial](api-http.log), [retry](api-http-retry.log). |
| TypeScript | API, provider API, tenant web and provider web initial checks completed without errors | Checks used noEmit and disabled incremental output. Source changes afterward limit transfer of this result. |
| Production frontend builds | Initial tenant/provider succeeded; final rechecks logged separately | Tool invoked installed root Vite; no clean install/container image certification. [Tenant](tenant-build.log), [provider final](provider-build-final.log). |
| SQLite migration replay | All 24 registered scripts applied to empty in-memory databases; schema mismatch found | Not live database deployment/upgrade, data-integrity or PostgreSQL proof. [Evidence](reproductions.json). |
| Current isolated security/parser checks | Final forged Origin rejected; original weight cases corrected; malformed unit/frame and slip replay/derived field weaknesses remain | [Final reproductions](final-reproductions.json). |
| Registry audits | Root 50 affected packages; desktop backend 61 | Current npm advisory lookup, not exploit execution or complete artifact SBOM scan. [Report](dependency-report.md). |

Additional final unit/build outcomes are in [verification status](verification-status.md). Logs and source manifests must travel with the report to avoid treating initial checks as proof of a later revision. No flaky-test diagnosis can be made from a single passing run; no skipped-test/coverage claim is extended to unexecuted archived/desktop suites.

### Business logic — formula trace and acceptance

| Calculation | Source and traced formula | Validation result and remaining requirement |
| --- | --- | --- |
| Physical inward net | Weighbridge helper / tenant receipt logic: gross minus tare | Isolated example 1000 − 100 = 900 kg. Real indicator data and permitted tare/measurement domain must be certified. |
| Deduction-only moisture | Excess = max(0, measured − contractual base); deduction = round(net × excess / 100, 2); billable = round(net − deduction, 2), bounded nonnegative | Example 900 kg, 10% vs 8% base gives 18 kg deduction, 882 kg billable. This is a configured contract interpretation, not a universal spinning-mill/GST rule. Agent helper still has a default baseline; no use as universal standard is approved. |
| Spinning mass | Input = sum consumed; output = yarn + waste + intermediate; final source permits ±2% plus 0.01 kg | Static boundary 100 kg input → 102 kg output passes current comparison. Unexplained loss must be represented explicitly and positive gain requires an approved measurement/process rule. BIZ-015. |
| Bag conversion | floor(weight / 60), remainder weight modulo 60 | Arithmetic is straightforward but hardcodes a packing policy. Different bag/cone/box contracts and two-decimal quantities need domain approval. |
| Autoconer billed weight | No complete cone gross/core/box tare model traced | **UNVERIFIED / missing implementation**; require gross minus core/box tare and named units/rounding rules from actual contracts. Do not invent universal tare. |
| Invoice line | round(quantity × rate, 2); subtract rounded line discount | Full API discount is an amount; legacy boolean overload interprets it as percentage. Tests must prove callers use correct mode. Finite/range validation exists in canonical function. |
| Document discount / GST | Discounted subtotal less document discount; proportionately allocate discount to lines; round taxable line and line tax; same-state CGST gets rounded half, SGST gets residual, otherwise IGST | Residual tax-base allocation is not conserved explicitly. State name strings/Tamil Nadu defaults are not a place-of-supply rules engine. BIZ-002/011. |
| Order amendment | Workflow-specific aggregate rounding versus canonical per-line rounding | Reproduced 3 × (1 × 0.10) at 5% gives 0.32 amendment versus 0.33 canonical. BIZ-001. |
| Tenant Store estimate | Sum quantity × salePrice × (1 + GST rate/100), formatted after summing | Three separate 0.10 items at 18% estimate 0.35 versus canonical 0.36. This active Store page uses real commerce APIs; its issue is formula drift, not demo data. BIZ-016. |
| Customer balance | Sum ledger debit minus sum ledger credit; invoice receipt reduces receivable; payment reversal adds debit | Source trace correct as a basic convention. Opening balances, advances, allocation/reversal, returns and complete history require real reconciliation, not only sum arithmetic. |
| Payment settlement | amountPaid + receipt, rounded to 2; reject greater than total − creditTotal − amountPaid; reversal creates negative payment and ledger debit | Positive finite/two-decimal checks and source/date checks exist. Idempotency is incomplete; live concurrent posting and settlement/credit edge cases unverified. |
| Double-entry journal | Normalize each debit/credit to money; reject negative/double-sided lines; sum debit − credit must equal zero | Existing validation is meaningful. SourceKey prevents duplicate journal creation, but historical source/posting reconciliation and DB constraints still need proof. |
| Inventory valuation / production cost | Chronological movement valuation and journal posting in business-ledger; production cost allocated through manufacturing clearing, WIP and inventory; full loss has PROCESS_LOSS journal path | Static trace only. Moving-average opening/imports, negative/backdated movements, wastage, WIP completion and supplier-price variance require approved golden fixtures and real ledger reconciliation. Not declared wrong solely because complex. |
| Supplier returns and variance | Posted return/credit values compared to moving-average issue cost; variance posted through clearing/price-variance accounts | Static trace exists; tax/credit-note date and real vendor reconciliation unverified. |
| Payroll | net = basic + overtime − deductions; payroll payable/deductions journal paths exist | Basic arithmetic present; attendance/rate derivation, statutory deductions, paid-state linkage and actual payment reconciliation incomplete. BIZ-014. |
| License | Expiry/grace comparisons and provider state sync | Suspension precedence, omitted response fields, inconsistent grace policy, stale clock/offline behavior and API entitlement enforcement fail review. |
| Quotas | Counts for users/machines/documents | Enforcement point, period definition and atomic concurrency are inconsistent; total outward-derived usage is not monthly document usage. |

No real mill contract, signed tax calculation pack, actual ledger dump, bank settlement, historical stock valuation or hardware trace was provided. Therefore **every financial formula is not certified as legally/commercially correct**. The table records what was traced and what was actually tested; the missing-tests plan specifies the remaining accounting acceptance matrix. No fabricated customer balances or bills were inserted to make verification appear complete.

## 4. Tenant isolation verification report

| Boundary | Source/isolated evidence | Verdict |
| --- | --- | --- |
| Tenant versus provider Prisma clients and env names | Separate packages/clients and datasource configuration | **Source design supports separation**; actual deployed URLs/permissions are unverified. |
| One database per customer | Intended isolated deployment, no shared tenant tables in active schema | **UNVERIFIED physically**; no two-customer deployment/backup/volume inventory. Absence of tenantId columns is acceptable for this topology. |
| Tenant API authorization | Global JWT/session and role guards; current user role comes from DB | **Partial verified control**, not a complete route/IDOR matrix. HTTP suite never reached requests. |
| Provider API protected from tenant users | Final guard rejects forged Origin without key | **Partial correction verified**; shared key/browser/default exposure and absence of named provider roles remain. A tenant JWT alone was not proven accepted. |
| Tenant telemetry identity | Arbitrary route companyId with provider-wide credential; no per-tenant key binding | **Fail design review**; company attribution and returned license must be bound to authenticated deployment. |
| Telemetry data minimization | Aggregate counts plus unrestricted additionalMetrics | **Fail zero-leakage guarantee**. Even counts are business metadata; define explicitly allowed operational aggregates. Reject arbitrary business objects/freeform payloads. |
| Provider remote actions | Local row completion without signed request/nonce/ack lifecycle | **Fail execution/trust guarantee**. |
| Network and secret separation | Named networks/volumes but tenant joins admin network; fixed containers; known defaults | **Incomplete**, actual ingress/IAM/volume ownership unverified. |
| Cross-tenant resource access and restore | No real A/B HTTP/DB/object-store/backup experiment | **UNVERIFIED**, release blocker. |

No direct query joining customer A’s business database to customer B’s business database was found in the inspected active services. This is **not a zero-leakage certification**. Provider cross-company control/telemetry risk and deployment misbinding are separate routes to isolation failure.

Acceptance must prove: unique DB ownership and credentials; no shared data volumes; distinct signing/session boundaries; A cannot read/write B through every route, queue, export, backup or restore; provider sessions cannot masquerade as tenant business users without an explicit authorized audited workflow; tenant credentials cannot call provider controls; malformed company IDs cannot redirect a heartbeat/command; restore of A cannot overwrite B. Use separate real disposable deployments, not two rows in one shared tenant database.

## 5. Provider versus tenant bundle separation report

Static import traversal reached **94 tenant source modules**, **5 provider modules** and **2 marketing modules** from their respective entrypoints. The [import graph](bundle-import-graph.json) is a conservative source graph: aliases, generated imports, assets and runtime URLs require additional inspection. It is not a complete bundler ownership manifest.

- No direct tenant-frontend import of provider frontend components, or provider-frontend import of tenant pages, was found in the traversed entries.
- Provider-only plan/license/flag fields are still returned to tenant settings/UI, so the stronger visibility requirement **fails** even without a copied provider page.
- Tenant’s lazy Insights import still makes legacy insight/e-way UI reachable in the build graph, even though navigation aliases can make direct access unlikely. Dormant Billing/Payments/InvoiceGenerator demo source is distinguished from reachable code; source presence alone is not proof it shipped.
- Shared `packages/` contains types/config/PDF/email/i18n/database concerns. Sharing explicit contracts is intentional; sharing database access or hidden master credentials is not. Provider build now generates admin Prisma after an external correction. Shared PDF code is not, by itself, cross-tenant data access.
- Tenant HTTP base uses a relative proxy with desktop-specific fallback; provider final base is hardcoded loopback HTTP with browser-held master credential. These are distinct strings, but not a secure complete separation of authentication flows.
- Build outputs were generated in the audit directory only. No frontend build can prove that production CDN assets, container layers or desktop packaged web-dist match those outputs.
- A redacted string check on final JS output confirms the provider fallback master-key literal is present in provider output and absent from tenant output. This is narrow concrete bundle evidence; it does not certify absence of all other secrets or cross-plane assets.

Required gate: emit actual per-plane bundler manifests/SBOMs, classify allowed shared packages, block opposite-plane app/database imports, scan assets for secrets/demo payloads, and run tenant/provider browser role tests against separate authenticated APIs. Current result is **partial static separation, failed provider-control visibility/auth policy, unverified deployment artifact separation**.

## 6. Hardcoded values, secrets and mock-data scan

See [redacted candidate scan](hardcoded-scan.md), [raw scan metadata](hardcoded-scan.json), [environment register](environment-register.md) and [source inventory](source-inventory.json). Values are intentionally not repeated where they resemble credentials.

Confirmed active-path defects include provider master-key fallbacks and browser injection, loopback provider API URL, demo company sync fallback, fixed device simulator credentials/data, provider tenant/control/activity samples, random connectivity and invented build/deploy/backup outcomes, fixed financial-risk rate, default state assumptions and fixed tax/packing labels. These map to specific issues rather than treating every literal as forbidden.

Developer localhost defaults, public brand names, example documentation, test fixtures, random animation and synthetic ledger bookkeeping have different meanings. They are not all leaks or mock production data. Dormant legacy InvoiceGenerator state-store demonstrations need exclusion gates, but are not all asserted to be reachable. The active tenant Store.tsx uses real commerce APIs. Current provider frontend fallback and hardware simulation paths **are** active evidence that the requested no-mock production condition fails.

The environment register currently contains **51 distinct statically referenced names** from source/examples/deployment files. Only JWT and selected port/bootstrap paths have partial explicit checks; most lack a unified fail-fast schema. `VITE_ADMIN_API_KEY` must never carry a provider master secret. `ADMIN_API_URL` and heartbeat configuration in Compose are not honored by the current sync implementation. Commented PostgreSQL/Redis/SMTP examples are not implementation or configuration validation.

This was a source/configuration/lockfile scan, not an exhaustive proof that every historical secret is absent. A tracked provider database journal and desktop initialization copy path require secure artifact/history investigation. Actual secret values, historical validity, log stores, ignored .env files, final image layers and cloud secret stores were not exhaustively extracted or disclosed. SEC-018/TEST-007 require approved scanning and rotation evidence before a clean secret attestation. Archived imported projects were inventoried where relevant but not certified as supported production applications; packaged desktop compiled sources were inspected for divergence, not exhaustively re-executed route by route. Destructive cleanup/delete utilities were not run.

## 7. Missing tests report

The [complete proposed test register](missing-tests.md) gives a concrete test name, expected acceptance and dependencies for every issue, including all dependency entries. These are recommendations; **no application test was added by this audit**.

Highest-priority acceptance suites:

1. `empty_and_populated_tenant_migrations_match_prisma_schema` and provider equivalent; interruption/restore and supported-database parity.
2. `provider_rejects_forged_origin_host_without_credentials` retained after external correction, plus named-user/MFA/role/session and deployed-artifact checks.
3. `two_deployments_cannot_access_each_others_db_api_backups_or_credentials`, expanded to every route, background job and restore.
4. `two_tenant_full_journey_with_all_role_denials_and_financial_reversal`: inward → QC/stock → production/WIP → dispatch → invoice → receipt → allocation/reversal/void → Tally → period close.
5. Integer-money and discount conservation properties; amendment/invoice equivalence; moving-average stock/GL reconciliation; backdates; rounding extremes; negative/NaN/precision boundaries.
6. Parallel invoice/receipt/number allocation and idempotency conflict tests; crash-after-commit/retry semantics; closed-period protection.
7. Complete license state matrix: active/expired/grace/suspended/reactivated/maintenance, clock skew/offline policy, monotonic signed updates, quota creation concurrency and monthly reset.
8. Hardware captured-frame certification; full-frame rejects; signature canonicalization, replay/time/sequence rejection; serial reconnect/offline replay; printer/scanner round-trip and reprint evidence.
9. Real gateway/IRP/e-way/Tally sandbox success/reject/timeout/duplicate/out-of-order/auth failure/reconciliation; SMTP bounce/opt-out; dead-letter replay.
10. UI direct-route role awareness, draft retention, duplicate submit, empty/error/loading state, all-six-register reconciliation, keyboard/focus/screen-reader/locales/print and low-end 3D fallback.
11. Clean container/VM/desktop builds, runtime file/secret/SBOM audit, migration failure gates, readiness, canary halt/rollback and random-tenant restore RPO/RTO.
12. Realistic load/stress/soak with retained history, SQLite contention, shared rate-limit enforcement and bounded query/job/backpressure behavior.

No “100% secure,” “no flaky tests,” “every dependency clear” or “all UI screens verified” statement is supported. CI currently tolerates lint and dependency failures and does not run all HTTP/provider/migration checks. Remote branch protection and override permissions are **UNVERIFIED**.

## 8. Architecture drift from the requested EverGreen OS principles

| Intended principle | Observed implementation | Required correction |
| --- | --- | --- |
| Strict isolated deployment/database per customer | Separate tenant/provider schema packages, but no demonstrated fleet provisioning or A/B isolation acceptance | Infrastructure ownership assertions and tests, never a shared customer business DB workaround. |
| Provider controls invisible/inaccessible to tenant staff | Tenant settings contain license/pricing/module/quota fields; server entitlements incomplete | Split internal license cache from tenant DTOs and enforce server policy. |
| Provider-only authenticated audited fleet control | Shared browser master key, caller actor header, unsigned/immediate-success actions | Named provider identity, scoped service identities, signed commands and immutable event audit. |
| No mocks in production paths | Provider fallbacks/simulated actions and agent simulator entrypoint | Remove or exclude demonstrations; unsupported controls must not claim completion. |
| SQLite small tenants/PostgreSQL large tenants | Active SQLite schemas/migrations only | Explicit supported database profiles and parity/upgrade certification. |
| Complete Book-Ellam six-register UI | Missing/mis-mapped registers and incomplete search/history | Canonical register API contracts with source reconciliation. |
| Real integrations | Tally export/SMTP/link composition are partial; government/gateway/cloud/device execution missing | Certified adapters and operational lifecycles, not decorative statuses. |
| Money/stock/audit correctness | Float money, multiple rounding paths, mass tolerance, selective audit coverage | Shared exact arithmetic, explicit conservation events and transactional audit/outbox. |
| Production-grade operations | Broken build inputs, swallowed migrations, no demonstrated recovery | Reproducible artifacts, gated rollout, tested backup/restore and monitoring. |
| English/Tamil/Hindi accessible UI | Partial en/ta, substantial inline text, Hindi absent; device/accessibility acceptance unverified | Complete locale catalog and documented manual/device acceptance. |
| Stack/port parity | Desktop retains separate compiled backend/web and ports; provider WebAuthn copied config references 5173; runtime Node versions differ | Supported execution-profile contracts with explicit ports/origins and reproducible artifacts. |

The repository documentation itself describes some modules as future/pending and contains historical claims that diverge from current source. The user’s stated principles are the acceptance baseline for this audit; outdated documentation is not used to excuse divergence or to claim features exist.

## 9. Prioritized fix roadmap

All changes below are **future work**, not work performed by this audit. Keep separate customer databases throughout. Each phase ends with evidence and acceptance tests; urgency does not justify bypassing architecture or audit controls.

### Phase 0 — blockers: security, data loss and isolation

**Owner:** security/platform lead with provider identity, database and SRE owners. **Indicative coordinated effort:** 3–6 weeks for a dedicated cross-functional team, subject to actual infrastructure access; not a promise derived by adding row estimates.

- Preserve and release-verify the externally corrected guard; remove browser/known master credentials, rotate exposed keys, design named provider sessions and roles. SEC-001–004, UI-001.
- Replace customer-session Database Studio access with a separate operator-only trust boundary, remove unrestricted tenant SQL, enforce MFA/audience and strict network/resource limits. SEC-019–022. Removing navigation links is insufficient.
- Prevent false backup/deploy/payment claims from being treated as operational evidence; isolate demo entrypoints and implement honest unavailable/pending/failure states while real services are developed. UI-002/003, INT-006/008. This is a permanent capability contract, not a cosmetic hot-fix.
- Deliver additive schema parity migrations and tested backup/restore/forward-repair, with deployment startup failing on incompatible schema. DB-001/002/009, REL-002/005.
- Establish per-tenant identity, payload allowlists and signed remote-action state machine; prove separate database/volume/network/backup ownership. API-004/006, SEP-002/004.
- Resolve credential-bearing diagnostics and print injection through proper session/print design; enforce global abuse budgets and safe ingress. SEC-006–009, REL-004.
- Triage runtime-critical advisories and produce clean artifact evidence. Proxy/trust issues receive immediate attention; tooling advisories are isolated and upgraded with appropriate prerequisites/tests. TEST-005/007 and DEP records.

**Exit:** no exposed shared/browser master key; fresh/populated migrations match; real restore works; all operational successes have real evidence; two-deployment isolation proof; exploit/regression tests and artifact scan pass. Unverified live deployment controls require explicit documented acceptance, not an assumed pass.

### Phase 1 — P0 correctness and stability

- Central money representation/calculation policy; line/document discount allocation; amendment consistency; material conservation with explicit gain/loss policy. DB-004, BIZ-001/002/015.
- Strict runtime request/response contracts, atomic idempotency/numbering and transactional critical audit events. API-001/002/008, SEC-013.
- Authoritative license transition and server entitlement policy, including offline/grace rules and explicit recovery actions. BIZ-005/006.
- Correct signed device canonicalization/full-frame parsing and replay state before using hardware output for billing. BIZ-008/009.
- Repair HTTP setup, run final-source domain/route/security suites, make required CI gates blocking. TEST-001/003–005/008.

**Exit:** financial and stock invariants survive concurrency/retry/crash tests; no unknown-field mass assignment; every critical write has committed actor/audit evidence; every protected route passes auth/role/license matrix on two isolated deployments.

### Phase 2 — P1 business logic and integrations

- Complete domain constraints/retention policies, timezone types, customer update/costing correctness, quotas, payroll settlement and approved mill/tax policy. DB-005/006/008/010, API-009/010, BIZ-007/010–014.
- Deliver genuine Tally, payment, GST/e-way, messaging, SMTP and device/printer adapters with sandbox/hardware certification and durable inbox/outbox. INT-001–010.
- Build provider operational UI from real job/acknowledgment data; align generated contracts and reactivation timing. UI-004/005, API-004.
- Establish structured observability, runbooks, durable recovery queues, supported VM/desktop releases and staged deployment rollback. REL-006–010.
- Complete session/passkey/HR permissions/privacy workflows. SEC-010–012/014/017.

**Exit:** end-to-end journey reconciles inventory, GL, party balances, tax documents and external settlement; duplicates/outages recover without false completion or duplicate financial effect. External certification waiting periods are planned dependencies.

### Phase 3 — P2 performance and scalability

- Choose and certify PostgreSQL support before selling it; retain database-per-customer architecture.
- Baseline realistic tenants and then add query-driven indexes, batched aggregations, bounded list/search contracts, incremental projections and scoped invalidation. DB-003/007, API-012, PERF-001/003/004.
- Optimize actual route/device bottlenecks with bundle budgets and lightweight 3D/export fallbacks; add backpressure and resource limits from measurements. PERF-002.
- Enforce package ownership, remove dormant production-reachable legacy paths and ship a complete artifact SBOM. SEP-003, UI-016, TEST-007.

**Exit:** agreed p95/p99/queue/CPU/memory/restore SLOs hold under documented load/soak, failure degradation is controlled, and cost assumptions are tied to actual usage data.

### Phase 4 — P3 UX and polish

- Complete correct six-register UI, role-aware actions/direct routes and reliable empty/error/loading/draft states; correctness-related UI items must begin earlier rather than wait for polish. UI-006–010/013.
- Deliver reviewed Tamil/Hindi/English catalogs, proper locale formatting and user-scoped preferences. UI-011/012.
- Complete keyboard, focus, contrast, screen-reader, reduced-motion and supported-device/manual print acceptance against an approved design specification. UI-015.

**Exit:** every screen in the screen register has recorded owner, role policy, data source, loading/error/empty behavior and device/accessibility evidence; no mock fallback conceals a failure.

### Phase 5 — P4+ enhancements

Only after earlier gates: optional forecasting, additional cloud providers, richer 3D effects, advanced cost analytics and expanded communication channels. These are **enhancements**, not invented defects. Assign P4–P7 after product/customer value and maintenance cost are defined. Any AI/automation result must carry real data provenance and cannot silently execute financial or provider actions.

## 10. No-hot-fix statement

**No application fix or hot-fix was made by this audit.** Recommendations require explicit domain contracts, correct trust boundaries, versioned migrations, atomic/idempotent state changes, recovery plans and acceptance tests. Existing source changes observed during the audit came from outside this audit; they are not certified as architecturally complete merely because a narrow reproduction now passes.

## 11. No-mock-data statement

**The requested statement that no production path depends on mock data cannot be confirmed; current evidence contradicts it.** Provider fallback tenants/records, simulated operational controls/CI-CD and the weighbridge simulator entrypoint remain in normal paths. Dormant examples and valid test fixtures are separately classified.

**This audit introduced no mock data into any production path or database.** Isolated arithmetic/parser checks used controlled values only in memory. Production no-mock acceptance requires removing/excluding live demonstrations and proving empty/error/offline states against real service contracts.

## 12. Final shipping checklist

- [ ] Release source/artifact hash is frozen; every test result matches that revision and reviewed dependency lockfiles.
- [ ] Known/default/browser-distributed provider secrets removed and rotated; no secrets in source/history/client bundles/images/logs remain unreviewed.
- [ ] Provider named-user MFA/session/role controls work; tenant credentials cannot access provider APIs or control assets.
- [ ] Each customer has verified independent database, storage, network and service credentials; A/B API/job/export/backup/restore isolation passes.
- [ ] Telemetry identity is tenant-bound; payload allowlist contains only explicitly approved aggregates; replay and arbitrary business payloads are rejected.
- [ ] Remote actions are authorized, signed, nonce-bound, idempotent, audited and completed only after genuine tenant acknowledgment.
- [ ] Fresh and populated tenant/provider migrations match schemas; migration failure blocks traffic; restore/forward repair is rehearsed.
- [ ] Money/discount/tax/ledger calculations share approved exact arithmetic; rounding conservation and reversal/credit/advance cases pass.
- [ ] Inward/tare/moisture/production/WIP/Autoconer rules are approved by mill owners; no unexplained created mass or unposted loss.
- [ ] Every critical mutation has strict runtime validation, correct role/domain/license policy, atomic posting, idempotency and immutable actor audit.
- [ ] License expiry/grace/suspension/reactivation/offline/maintenance transitions and all quotas pass concurrent boundary tests.
- [ ] All six registers reconcile to canonical data; every screen has role, live data, loading/error/empty, pagination and direct-route evidence.
- [ ] No production demo fallback, fabricated payment/backup/deploy success or simulator entrypoint is reachable.
- [ ] Tally/gateway/IRP/e-way/messaging/email contracts pass real sandbox acceptance; callbacks verify signatures, replay and retries; reconciliation is recorded.
- [ ] Device/printer/scanner integrations pass actual hardware tests, malformed frames, offline replay, disconnect recovery and audited reprint tests.
- [ ] TLS/headers/proxy trust/session/CSRF policy are verified at the real ingress; diagnostic/database tooling is appropriately restricted.
- [ ] Custom Studio cannot bypass TOTP, expose sensitive tables to tenant roles or execute caller SQL using customer sessions; its routes are tested independently from Nest.
- [ ] Current dependency and final-artifact scans have no unaccepted advisories; all exceptions have owner, scope, expiry and compensating evidence.
- [ ] Required unit/HTTP/contract/security/isolation/browser/migration checks block CI/releases; branch protection and overrides are reviewed.
- [ ] Logs are structured/redacted/correlated; alerts, traces, queues, dead letters and incident runbooks are exercised.
- [ ] Encrypted consistent offsite backups and independent tenant restore meet approved RPO/RTO; recovery never overwrites another tenant.
- [ ] Target-profile load/stress/soak, DB contention and low-end device performance meet measured budgets.
- [ ] English/Tamil/Hindi, keyboard/screen-reader/focus/contrast/reduced-motion and print acceptance pass against the approved UI specification.
- [ ] Privacy/retention/export/erasure and applicable tax/payroll obligations are approved by qualified owners.
- [ ] Every UNVERIFIED item has either completed evidence or an explicit accountable release exception; silence is not approval.

## Evidence package index

Core deliverables: [issue register](issue-register.md), [CSV](issue-register.csv), [JSON](issue-register.json), [missing tests](missing-tests.md), [dispositions](dispositions.md), [verification status](verification-status.md).

Inventories: [Nest routes](route-register.md), [custom Studio routes](studio-route-register.md), [screens](screen-register.md), [schemas](schema-register.md), [migrations](migration-register.md), [environment variables](environment-register.md), [dependency advisories](dependency-report.md), [hardcoded candidates](hardcoded-scan.md), [bundle import graph](bundle-import-graph.json), [initial source inventory](source-inventory.json), [final source hashes](source-final-manifest.json).

Reproduction inputs/results: [initial](reproductions.json), [final](final-reproductions.json). Reproduction/helper scripts are audit evidence only and do not modify application source. Build artifacts and test/coverage logs in this directory are supporting evidence, not release artifacts.
