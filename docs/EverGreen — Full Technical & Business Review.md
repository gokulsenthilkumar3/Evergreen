# EverGreen — Full Technical & Business Review

Nov 4, 2026 · @Gokul Senthilkumar

## Executive summary

Verdict: EverGreen solves a real, well-chosen problem with a solid codebase, but it is not ready to sell to a paying mill. It needs about 6–10 focused weeks on data, compliance and deployment before a pilot, and the marketing site must stop claiming results that do not exist yet.

**What is genuinely good**

- A sharp niche: a textile ERP that speaks the spinning mill's language (bales, lots, waste, job work, BookEllam registers, Tamil UI). Tamil Nadu holds about 46% of India's spinning capacity, and Erode is one of its clusters.
- A sensible architecture for the stage: a TypeScript modular monolith (React + NestJS + Prisma), one installation per customer, shared packages, default-deny API roles.
- Real engineering care: argon2id passwords, TOTP, passkeys, OIDC, session revocation, signed licences, a hardened Electron shell, 285 passing web tests, and an unusually honest self-audit (250 tracked issues).

**What blocks a paying customer today**

| # | Blocker | Why it matters to a mill owner |
| --- | --- | --- |
| 1 | Invoice numbers default to `INV-<timestamp>` (17 characters, not a yearly series) | GST invoice rules expect a consecutive serial of at most 16 characters per financial year |
| 2 | SQLite with money stored as floating-point numbers | Rounding drift in ledgers; one writer at a time for the whole company |
| 3 | Every stock posting re-checks the entire books inside one 60-second transaction | Saving gets slower every month as data grows; year 2 will feel broken |
| 4 | Behind the shipped nginx proxy, every user shares one IP address | 20 failed logins per 15 minutes locks out the whole factory; 10 shop orders per 15 minutes blocks all customers |
| 5 | Marketing site shows invented live figures (140K+ spindles, ₹18.4L fraud caught, 99.98% uptime) | Misleading-advertising and trust risk with the first serious buyer |
| 6 | Weighbridge capture, e-invoice/e-Way Bill and provider sync are simulated or disabled | The headline "anti-fraud gate" feature is not real yet |
| 7 | 1 critical and 5 high production dependency advisories today; lint errors rising (web 428 → 509) | CI's own audit and lint gates fail on `main` |

**Biggest strategic risk:** focus. The last two merges added about 76,000 lines (Tamil localisation, helpdesk, floating AI agent, owner hosting) after the 30 October review, while 30+ P0 items in the project's own register remain open. One developer authors 137 of 145 commits.

**Recommendation:** freeze new features, close blockers 1–4 and 7, rewrite the marketing claims, then run one real pilot mill on PostgreSQL for 60 days. Details per area follow in Parts 1–8.

## Part 1 — What the product is and how it was reviewed

EverGreen is an ERP for textile businesses (spinning mills, traders, warehouses, job-work units) covering cotton receipt, production, stock and lots, job work, sales orders, GST invoices, payments, costing, HR, machines and quality, plus a separate provider console for licensing customers.

**Size of the codebase (excluding node\_modules)**

| Area | Lines of code | Role |
| --- | --- | --- |
| `apps/web` | 39,120 | Staff app and public shop (React 19 + MUI) |
| `apps/api` | 26,620 | Customer API (NestJS 11 + Prisma, 215 routes) |
| `apps/admin-api` | 5,639 | Provider API (49 routes) |
| `apps/admin-web` | 5,912 | Provider console |
| `apps/marketing-web` | 7,076 | Marketing site plus static demo themes |
| `scripts` | 4,235 | Dev, release, security and audit tooling |
| `packages/*` | 1,985 | Shared types, PDF/invoice maths, schemas, i18n, email |
| `apps/desktop`, `apps/weighbridge-agent` | 960 | Electron shell and weighbridge parser |

Two Prisma schemas: 63 customer tables and 10 provider tables. 911 tracked files, about 3,400 lines of top-level docs plus dated audits.

**What I did** (commit `0307795`, 2 Nov 2026)

- Read the architecture, business-flow and status docs, then checked their claims against source: bootstrap, guards, auth, rate limiting, storefront, invoicing, reconciliation, proxy and Docker recipes, Electron, marketing copy.
- Installed dependencies, built all three web apps, ran the web (285 tests), provider web (19) and weighbridge (28) suites: all passed.
- Ran `npm audit`, web lint, measured bundles, and loaded each built app in headless Chrome at 1440 px and 390 px (phone run throttled to 4 Mbps, 150 ms, 4× CPU).
- Researched the market: competitors, GST rules, Tamil Nadu mill economics.

**What I could not do here:** the sandbox blocks Prisma's engine download, so the two APIs and their 400+ backend tests could not run, and screens behind login were not exercised. Backend findings are from reading code. `xlsx` was installed from npm instead of the blocked SheetJS CDN for the build only.

## Part 2 — Architecture, language and dependencies

The architecture is right for a small vendor: a modular monolith, one isolated installation per mill, and separate provider and customer systems. The weak layer is the database, not the shape.

&#91;embedded content: EverGreen deployment · from deploy/docker/compose.yml and docs/ARCHITECTURE.md\]

Each mill gets its own web, API and database; the provider side is separate. The optional Groq AI calls and the marketing site are left out for clarity.

### Language

TypeScript end to end (Node 22, TS 5.7–6.0). Good choice: one language for UI, API, desktop and tooling, and shared types between them. Type safety is diluted in practice:

- About 200 `any` uses in the customer API, 254 in the web app, 37 in the provider API; 38 customer and 8 provider handlers accept untyped `@Body() any`.
- Web lint: 509 errors (336 `no-explicit-any`, 140 unused variables), up from 428 on 30 October. The project's own records show 1,496 API and 211 provider-API lint errors.
- Four TypeScript versions across workspaces (`latest`, `~5.9.3`, `^5.7.3`, `~6.0.2`); `latest` in shared packages makes builds non-reproducible.

### Architecture review

| Decision | Assessment |
| --- | --- |
| Modular monolith with domain modules | Good. Right size; do not split into microservices |
| One installation and database per customer | Good for isolation and data trust in Indian SMEs; costly to operate at 50+ customers without automation |
| SQLite for both databases | Weak. Single writer, no exact decimal type, no server-side backup tooling. Target PostgreSQL is decided but not started |
| `stockTransaction` with full reconciliation | Correct but unscalable (Part 3) |
| Business logic in `@evergreen/types` (Groq client, licensing, migration) | Smell. A "types" package that makes network calls blurs boundaries |
| `App.tsx` 1,113 lines; services of 1,400–2,300 lines | Maintainability risk. `workflows.service.ts` is 2,333 lines |
| Generated docs, audits and an issue register in-repo | Strong practice, but the register's status text drifts from reality |

### Dependencies

| Layer | Main packages | Notes |
| --- | --- | --- |
| Web UI | React 19.3, MUI 7, TanStack Query 5, react-hook-form, zod 4, recharts 3, framer-motion, three.js + react-three-fiber, jspdf, xlsx (SheetJS CDN), axios | Heavy: three.js and jspdf are large; MUI and Emotion add runtime CSS cost |
| API | NestJS 11, Prisma 5.22, passport-jwt, argon2, bcrypt, otplib, @simplewebauthn, openid-client, helmet, nodemailer, swagger | Mainstream, well supported. Prisma 5 is a major version behind |
| Desktop | Electron 44.9, electron-builder 26, electron-updater | Current |
| Tooling | Vite 7 and 8, Vitest 5, Jest 30, ESLint 9, oxlint, Playwright | Two bundler and two test-runner majors in one repo |
| AI | Groq HTTP API (`openai/gpt-oss-20b` default) | External, optional, budgeted |

`npm audit --omit=dev` today: 1 critical (DOMPurify via jspdf), 5 high (multer/@nestjs/platform-express, body-parser, follow-redirects via axios, zod), 2 moderate (nodemailer, qs). Including dev tooling: 65 advisories. These appeared after the 19 October "zero advisories" record, and CI's `--audit-level=high` gate would fail. The `xlsx` tarball comes from `cdn.sheetjs.com`, outside the npm registry; if that host is unreachable, `npm ci` fails (it did here).

## Part 3 — Backend and API

The backend's rules are careful (closed periods, lot ownership, GST state checks, replay keys on payments), but the way it enforces them will not survive real data volumes.

### Request path

Every request passes three global guards: installation licence, JWT session, then role. Routes without `@Roles` default to VIEWER for reads, MODIFIER for writes and ADMIN for deletes, and per-user path rules can narrow further. This default-deny design is good.

Cost per authenticated request: one session read, one user read with access rules, one session-policy read and one session **write** (`lastActive`). The code comment calls the write "fire and forget", but it is awaited. On SQLite every page poll therefore takes the single write lock.

### The reconciliation problem

`PrismaService.stockTransaction` wraps every stock or ledger change. Inside one transaction with a 60-second timeout it runs:

1. `reconcileStock` and `reconcileLots` before the work.
2. The work itself.
3. `reconcileStock` twice and `reconcileLots` once more, plus guards.
4. `reconcileFinance`, which loads **every** costing entry, payroll entry, production and invoice and re-posts a journal for each, one query at a time.
5. `reconcileValuation`, and two closed-period snapshots.

Work per posting grows with total history, not with the size of the change. A mill doing 30 invoices and 20 receipts a day reaches about 18,000 documents a year; each new save then rescans all of them while holding SQLite's only write lock. Expect saves to slow from milliseconds to seconds within the first year, and timeouts later. The team flags this (EG-08) but has not measured it.

### Data model

- 110 `Float` columns and 0 `Decimal` columns: rupees and kilograms are binary floating point. The invoice maths rounds through paise with `BigInt`, which helps, but stored ledger sums can still drift.
- 28 indexes across 63 tables; reconciliation queries filter on columns that are often unindexed.
- No WAL mode or busy timeout is configured for SQLite.
- The seller state defaults to the string `"Tamil Nadu"` and states are compared by name, not GST state code.

### API surface

| Aspect | Finding |
| --- | --- |
| Size | 215 customer routes, 49 provider routes |
| Docs | Swagger in development only; `docs/reference/API.md` lists 150 rows, so it is stale after the last merge |
| Versioning | None (`/v1` absent); the desktop app and web app share the contract |
| Validation | Global `ValidationPipe` with whitelist, but 46 handlers take `any` bodies, including public `POST /storefront/orders` |
| Idempotency | Present for invoices, payments and workflow documents; missing for orders, job work and stock adjustments |
| Numbering | `INV-${Date.now()}` when the operator leaves the number blank; caller may set any number |
| Errors | Mixed: invoice verification returns 400 for "not found" |
| Integration API | No API keys, webhooks or events for third parties; Tally is export-only XML |
| Caching | Every response is `no-store`, including reference data |

### What works well

GST rate is taken from the catalogue and a mismatch is rejected; CGST/SGST versus IGST follows seller and buyer GSTIN states; closed accounting periods block back-dated posts; `/admin-ops/migrate` and boot auto-migration are disabled in favour of release tooling; public helpdesk ingress is HMAC-signed with timestamp and nonce.

## Part 4 — Security

Authentication is stronger than most Indian SME software; the gaps are in deployment plumbing, browser token storage and dependency hygiene. I found no secrets committed to the repository.

### Strengths

- Passwords: argon2id (64 MB, 3 passes), 12-character minimum; bcrypt and legacy hashes upgraded on login.
- TOTP 2FA, recovery codes, passkeys (WebAuthn), OIDC single sign-on with one-time tickets.
- Server-side sessions checked on every request, revocable, with per-role idle and absolute expiry; password change signs out other sessions.
- JWT secret must be at least 32 characters and not a placeholder; provider key likewise.
- Ed25519-signed installation licences; only the public key is in the repo.
- Electron: `contextIsolation`, `sandbox`, no Node integration, navigation and pop-ups blocked.
- Public staff signup disabled; Swagger off in production; Helmet with `frame-ancestors 'none'`; CORS pinned to one origin.

### Findings, highest risk first

| Severity | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| High | Client IP is the proxy's IP in the Docker recipe. Login (20 per 15 min), shop orders (10 per 15 min) and public AI budgets are shared by everyone. One attacker, or one busy morning, locks out the whole company | `main.ts` trusts only `loopback`; nginx runs in a separate `tenant-web` container | Trust the Docker network or read `X-Real-IP` from the known proxy; add per-account lockout |
| High | Bearer token kept in `localStorage` ("remember me") or `sessionStorage`, while CSP allows `'unsafe-inline'` scripts. Any XSS steals a 1-day session | `utils/authStorage.ts`, `main.ts` CSP | HttpOnly SameSite cookie, nonce-based CSP |
| High | Production advisories: DOMPurify (critical), multer, body-parser, follow-redirects, zod | `npm audit --omit=dev` | Update NestJS platform, axios, jspdf, zod; make the CI gate block merges |
| Medium | Plaintext password comparison path still exists for legacy rows | `passwords.ts` | Force reset of any non-hashed row, then delete the path |
| Medium | Provider console uses one shared API key: no named operators, no RBAC, no per-person audit | `ProviderAccessGuard` (SEC-003) | Named provider accounts with TOTP |
| Medium | CSP `connect-src` allows any `http:`, `https:` and `ws:` host, which helps data exfiltration after XSS | `main.ts` | Restrict to self and the Groq host |
| Medium | nginx: no HSTS; security headers vanish on static assets because a nested `add_header` overrides them; deprecated `X-XSS-Protection` | `nginx-tenant.conf` | Move headers to an included snippet; add HSTS at the TLS edge |
| Medium | No per-account login lockout or global throttling; in-memory limits reset on restart | `public-order-rate-limit.guard.ts` | `@nestjs/throttler` (already a root dependency, unused) with per-username keys |
| Low | Public AI endpoints can be used as a free chatbot up to the daily budget | `assistants.controller.ts` | Captcha or signed shop session |
| Low | Invoice verification has no rate limit (key is a random UUID, so enumeration is impractical) | `invoice-verification.controller.ts` | Add the public limiter |

### Data protection (DPDP Act)

The system stores staff names, emails, IPs and device data, customer phones, addresses and GSTINs. There is no data-retention setting, export-my-data or delete flow, and backups are not yet encrypted off-site (EG-04). Plan these before onboarding customers whose data is regulated under India's Digital Personal Data Protection Act.

## Part 5 — UI, loading and performance

The staff app is clean, responsive and lazy-loaded by route, but its first download is 607 KB compressed, mostly a single 1.2 MB script that includes the whole Tamil dictionary for every user.

### Measured load (built apps, headless Chrome, API offline)

| App | Viewport | Transferred | Requests | First contentful paint | Horizontal overflow |
| --- | --- | --- | --- | --- | --- |
| Staff web | 1440 px | 607 KB | 5 | 0.66 s | No |
| Staff web | 390 px, throttled | 607 KB | 5 | 1.62 s | No |
| Provider console | 1440 px | 128 KB | 4 | 0.42 s | No |
| Provider console | 390 px, throttled | 128 KB | 4 | 1.11 s | No |
| Marketing | 1440 px | 127 KB | 5 | 0.84 s | **Yes** |
| Marketing | 390 px, throttled | 127 KB | 5 | 1.71 s | **Yes** |

Throttled = 4 Mbps, 150 ms latency, 4× slower CPU, a fair stand-in for a mill office PC on 4G. These numbers cover only the first screen; the API was not running, so screens behind login were not timed.

### Bundle findings

&#91;embedded content: apps/web/dist/assets after vite build, commit 0307795\]

- Staff web ships 4.86 MB of JavaScript in 89 files. The entry chunk is 1,206 KB (346 KB gzip).
- `locales/ta.ts` (356 KB source, about 1,080 strings) is imported eagerly in `i18n.ts`, so English users download Tamil too. Loading it on demand cuts the entry chunk by roughly a quarter.
- three.js (`OrbitControls` chunk 891 KB, 240 KB gzip) powers the decorative 3D Command Center and login scene. It is lazy, but an office PC with integrated graphics will struggle.
- Export libraries are lazy chunks: xlsx 414 KB, jspdf-autotable 406 KB, html2canvas 196 KB, recharts 317 KB.
- Google Fonts are fetched at runtime; on an offline desktop or a blocked network, text falls back (seen here as failed requests).

### UI and UX assessment

| Aspect | Assessment |
| --- | --- |
| Visual design | Consistent MUI theme; licence and error screens are clear and calm (screenshots checked at both widths) |
| Navigation | 35 lazy routes, guided versus full workspace modes, business modes hide irrelevant screens. Good for mixed-skill staff |
| Localisation | Tamil UI with Tamil digits and ரூ. option is a real differentiator. Keys are English sentences, so any copy change silently drops the Tamil |
| Forms | react-hook-form + zod on newer screens; older pages hold `any` state; repeat-click guards added 30 Oct |
| Polling | 14 queries refresh every 15–60 s. With 15 staff that is about 150 requests a minute, each one a database write (Part 3) |
| Accessibility | Not tested with a screen reader; colour contrast on the dark marketing theme is not verified |
| Marketing site | Overflows horizontally on phone and desktop; nine alternative demo themes plus duplicated copies live in the repo |
| Large components | `ProductionEntry.tsx` 1,067 lines, `Dashboard.tsx` 993, `CommandCenter.tsx` 990: hard to change safely |

### Server performance risks (from code)

1. Reconciliation of all history on every posting (Part 3) — the main risk.
2. A session write on every request, competing with that 60-second transaction for SQLite's single lock.
3. All responses `no-store`, so catalogues and settings are re-fetched on every poll.
4. No load test exists. The first one should be 20 concurrent users on one year of synthetic data.

## Part 6 — Business flow: does it work, and can it be sustained?

The core money path (receipt → order → invoice → payment) has been shown working once on a disposable database; production, dispatch, job-work returns and PDF output have not been run end to end, and no real operator has used it.

### Flow status

| Step | Built | Verified | Gap that matters |
| --- | --- | --- | --- |
| Company setup | Yes | API, 30 Oct | Invoices blocked until GSTIN and address saved: good |
| Cotton receipt / weighbridge | Partly | No | Weighbridge capture is a simulation with a fixed key; moisture settlement depends on manual entry |
| Production and waste | Yes | No | Mass-balance tolerance is symmetric and can create stock (BIZ-015) |
| Stock, lots, holds | Yes | Partly | Legacy mill stock and catalogue stock are two ledgers bridged by `stock-bridge.ts` |
| Dispatch | Yes | No | Orders and stock adjustments lack server retry keys; a network retry can double-post |
| Invoice | Yes | API, 30 Oct (₹6,250 + ₹312.50 IGST) | Timestamp numbers; no IRN/e-invoice; no e-Way Bill |
| Payment and ledger | Yes | API, 30 Oct (partial + full, replay once) | No bank reconciliation; reversals in accounts unproven |
| Tally | Export XML | Live data, 30 Oct | One-way; ledger mapping and import acknowledgement missing |
| Provider sync and billing | Partly | No | Sends no credential; counts lifetime, not billing-period usage |

### Is the business flow working as expected?

For a demo, yes. For a mill's books, not yet:

- Two stock ledgers reconciled by code at every save is clever but fragile; a bug here corrupts both stock and valuation.
- Invoice numbering would fail a GST audit as built.
- Float money and SQLite mean the ledger cannot be trusted at audit time without a migration.
- The 30 October review fixed real defects (phone layout, GST rate override, Tally sign errors, unfireable overdue alerts). That shows the flow had not been exercised before, and the 76,000 lines merged since then have not been re-reviewed.

### Can it be sustained?

| Factor | Today | Risk |
| --- | --- | --- |
| Team | One author for 137 of 145 commits, plus AI-assisted branches | High bus factor; support and development compete for one person |
| Change size | Last two merges: 283 and 206 files, 29,498 and 46,984 lines added | Unreviewable; regressions hide |
| Backlog | 250 tracked issues; by my reading of their status text about 40 P0 not fully resolved | Plans exist; execution trails features |
| Operations model | One installation per mill (web, API, DB, secrets, backups) | At 20+ mills, upgrades, backups and support become the job |
| Revenue model | ₹3,999–14,999/month tiers or ₹12 per bale and ₹4 per invoice (marketing page) | Plausible for the segment; billing metering is not built |
| Licence | No source licence chosen | Blocks investors, partners and contractors |

Sustainable if the scope shrinks: one segment (small and mid spinning mills in the Erode–Tiruppur–Karur belt), one deployment form (managed cloud or desktop, not both at first), and a hard rule that P0s close before features.

## Part 7 — Market need, gaps and automations

The need is real and local: Tamil Nadu has 1,861 of India's 3,376 spinning mills, and a CITI survey published in September 2026 found 38% of textile firms run without digital systems and only about 14% are fully integrated. The opportunity is margin protection, not features.

### What the market is going through

- **Margin squeeze.** In June 2026 the Open-End Spinning Mills Association warned 250+ OE mills across Karur, Somanur, Palladam, Avinashi and Erode would cut output 50% because cotton-waste prices stayed high even as raw cotton fell from about ₹195 to ₹172 per kg. Owners will pay for software that shows real cost per kg and yarn realisation, not for 3D dashboards.
- **Compliance pressure.** E-invoicing applies above ₹5 crore turnover, and businesses above ₹10 crore must report to the IRP within 30 days. Many mid-size mills are above ₹5 crore, so an ERP without e-invoice is a non-starter for them.
- **Cash-flow law.** Section 43B(h) makes buyers lose the tax deduction if they pay Udyam-registered micro and small suppliers after 15 days (no agreement) or 45 days (with one). Mills are both buyers and MSME sellers.
- **Tally is the incumbent ledger.** Most mills keep accounts in Tally with a CA; an ERP that fights Tally loses. Two-way sync wins.

### Competitors

| Vendor | Product | Positioning |
| --- | --- | --- |
| [Ramco](https://ramco.com/blog/erp/spinning-efficiency-maximizing-productivity-with-textile-erp-solutions) | Textile/spinning ERP | Enterprise, cloud, large mills |
| [Datatex / Infinite](https://www.indiantextilemagazine.in/datatex-partners-infinite-for-the-indian-market-launches-rapid-now-for-smes/) | NOW ERP, Rapid NOW for SMEs | International textile ERP, pre-configured for India |
| [Sathguru](https://www.sathguru.com/news/2013/06/21/sathgurus-yarena-dedicated-erp-weaves-efficiency-for-the-textile-industry/) | Yarena | Spinning-specific, long-established in TN |
| [Intex Consulting](https://www.indiantextilemagazine.in/intex-extends-erp-solutions-to-shop-floor-monitoring/) | Textile ERP + shop-floor monitoring | Mid-size mills |
| [Smaac](https://smaac.in/smaac-tex) | Smaac-Tex | Dyeing, knitting, garments; Tally/Busy/SAP links, weighing scale, barcode, mobile |
| [Udyog](https://www.udyogsoftware.com/best-textile-erp-software) | Textile ERP | SME, multi-segment |
| Tally + Excel | Status quo | Cheapest, CA-supported, what EverGreen really competes with |

EverGreen's opening: a modern, Tamil-first, affordable product for small and mid spinning and OE mills that the enterprise vendors overprice and the generic tools underserve.

### Where EverGreen is ahead

- Tamil interface with Tamil numerals and BookEllam register vocabulary.
- Contract-specific moisture settlement and weighbridge slip signing (once real).
- Lot-level traceability linking cotton to yarn to invoice.
- Offline-capable desktop install with signed licences, which suits mills with unreliable internet.

### What is missing, by business value

| Priority | Missing capability | Why the mill pays |
| --- | --- | --- |
| Must | GST e-invoice (IRN, QR) via a GSP | Legal requirement above ₹5 crore |
| Must | e-Way Bill generation | Every yarn truck above ₹50,000 needs one |
| Must | Compliant invoice and challan series | GST audit |
| Must | Two-way Tally sync (masters, vouchers, acknowledgement) | Keeps the CA on side |
| Must | Real weighbridge capture (serial/USB) with tamper evidence | The anti-fraud promise |
| High | Cost per kg and yarn realisation by count, daily | Survival metric in this squeeze |
| High | Receivables ageing with 43B(h) clocks for MSME suppliers and buyers | Avoids lost deductions and chases cash |
| High | Mobile approvals for the owner (dispatch, credit, purchase) | Owners run mills from their phones |
| Medium | Bank statement import and auto-match | Cuts accountant hours |
| Medium | Machine/energy data from meters (EB units per kg) | Power is the second-largest cost |
| Later | Multi-mill group view, purchase/indent, export documents | Growth segments |

### Automations to build

1. **WhatsApp Business API messages**: invoice PDF on posting, payment reminders at 7/15/30 days, dispatch alerts to buyers. Today it only builds a wa.me link a person must send.
2. **Daily owner digest** at 8 am: yesterday's production, waste %, dispatches, collections, cash due this week, cost per kg.
3. **Auto e-invoice and e-Way Bill** on invoice post, with retry and acknowledgement stored on the invoice.
4. **Weighbridge to receipt**: slip captured, signed and matched to the purchase contract; moisture deduction calculated automatically and flagged when outside contract.
5. **Tally push** each night with a reconciliation report of what Tally accepted.
6. **Exception alerts**: negative stock attempt, waste above norm per count, cotton lot price above contract, overdue MSME payables near day 45.
7. **Bank feed matching** of receipts against open invoices.

The AI assistants (Groq) are a nice touch, but they currently answer only generic questions with no data access. Keep them secondary until the automations above exist.

## Part 8 — Prioritised action plan

Close the trust and compliance blockers first, prove one pilot, then automate. Effort assumes one full-time developer.

1. **Week 1 — stop the bleeding (3–4 days)**
   - Fix client-IP trust behind the Docker proxy; add per-username login lockout using `@nestjs/throttler`.
   - Upgrade the packages behind the critical and high advisories; make `npm audit` and lint block merges.
   - Replace every invented number on the marketing site with real, labelled demo figures; fix its horizontal overflow.
   - Freeze feature merges; require pull requests under about 1,000 lines.
2. **Weeks 2–3 — compliance**
   - Document-series table per financial year, numbers of 16 characters or fewer, allocated inside the posting transaction; stop accepting caller numbers.
   - Server retry keys on orders, dispatch, job work and stock adjustments.
   - Delete the plaintext-password path after forcing resets.
3. **Weeks 3–6 — data layer**
   - Move to PostgreSQL with `Decimal` money and quantities; migration plus reconciliation report against the SQLite copy.
   - Make reconciliation incremental (only touched items, lots and documents), keep the full run as a nightly check.
   - Drop the per-request session write to once a minute; cache reference data.
   - Load test: 20 users, one year of synthetic data, every save under 500 ms.
4. **Weeks 6–8 — must-have integrations**
   - e-invoice and e-Way Bill through one GSP sandbox, then production.
   - Real weighbridge capture on one supported indicator model.
   - Tally two-way sync with acknowledgement.
5. **Weeks 8–16 — pilot**
   - One mill near Erode, 60 days, real operators, weekly reconciliation with their CA.
   - Measure: entry time per receipt, invoice errors, days-sales-outstanding.
6. **After the pilot — automations**
   - WhatsApp Business API, owner digest, exception alerts, bank matching (Part 7).

**Quick wins under a day each:** lazy-load the Tamil dictionary; self-host fonts; fix nginx header inheritance and add HSTS; make invoice verification return 404 and rate-limit it; pin `typescript` in shared packages; choose a source licence.

## Sources and evidence

**Code:** [gokulsenthilkumar3/Evergreen](https://github.com/gokulsenthilkumar3/Evergreen) at `0307795`. Key files: `apps/api/src/main.ts`, `guards/*`, `modules/auth/*`, `services/prisma.service.ts`, `services/business-ledger.ts`, `modules/commerce/commerce.service.ts` (line 1050), `deploy/docker/compose.yml`, `deploy/docker/nginx-tenant.conf`, `apps/web/src/i18n.ts`, `apps/marketing-web/src/App.tsx`, `docs/audits/2026-10-11/issue-register.csv`.

**Runs in this review:** web Vitest 285/285, provider web 19/19, weighbridge 28/28; Vite builds of all three web apps; web ESLint 509 errors; `npm audit`; headless Chrome load timing. Backend tests not run (Prisma engine download blocked).

**Market:**

- [Tamil Nadu textile industry shifting towards value addition](https://apparelresources.com/business-news/manufacturing/tamil-nadu-textile-industry-shifting-towards-value-addition-and-differentiation/), Apparel Resources, 13 Jun 2026
- [38% of textile firms operate without digital systems: CITI](https://apparelresources.com/business-news/manufacturing/38-textile-firms-operate-without-digital-systems-citi/), Apparel Resources, 10 Sep 2026
- [Tamil Nadu OE mills warn of 50% production cut](https://textileinsights.in/tamil-nadu-oe-mills-warn-of-50-production-cut-over-cotton-waste-prices/), Textile Insights, 18 Jun 2026
- [India's 2026 e-invoicing rules](https://www.vatupdate.com/2026/02/23/indias-2026-e-invoicing-rules-turnover-limits-30-day-reporting-and-mandatory-2fa-explained), VATupdate, 23 Feb 2026
- [Section 43B(h) of the Income Tax Act](https://cleartax.in/s/section-43bh-of-income-tax-act), ClearTax
- Competitor pages linked in Part 7

The ₹50,000 e-Way Bill threshold and the GST 16-character invoice serial rule are from general knowledge; confirm both with your tax adviser.
