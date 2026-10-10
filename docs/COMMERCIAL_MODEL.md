# EverGreen — Licensing, Pricing and Commercial Model

> **Status:** Open proposal for customer discussion.  
> Share this document as-is. Prices require commercial validation before customer commitments.  
> The software source-code license is separate from this commercial model — confirm the intended
> open-source or proprietary license before redistribution.

---

## 1. What Makes EverGreen Different

Most ERP tools for textile/yarn/warehouse mills are either:
- Too complex and expensive for small operators, **or**
- Too simple for growing / high-volume companies

EverGreen's unique position:

| Differentiator | How EverGreen delivers it |
|---|---|
| **Traceable handoffs** | Every kg of material has an origin, owner, lot, and audit trail |
| **No phantom stock** | Catalogue entry alone creates no stock; receipts and production create it |
| **Partial everything** | Partial dispatch, partial invoice, partial job-work return, partial payment — all correct |
| **Guided start** | A new business can enter its first receipt within 10 minutes in GUIDED mode |
| **Business mode** | A warehouse-only company never sees mill/spinning screens |
| **Idempotent writes** | Retrying a request never creates a duplicate record |
| **Open model** | This pricing document is publicly shareable with proposal status intact |

---

## 2. Who the App Is For

### 2.1 Company Types Supported

| Company Type | Business Mode | Description |
|---|---|---|
| **Warehouse-only** | `WAREHOUSE_ONLY` | Receives and dispatches material; no in-house production |
| **Spinning Mill** | `MILL_ONLY` | Cotton → yarn production with waste and WIP tracking |
| **Processing-only** | `PROCESSING_ONLY` | Job-work contractor; processes others' material |
| **Trader / Distributor** | `TRADER` | Buys and sells; multi-product catalogue; no physical transformation |
| **Integrated Mill+Warehouse** | `INTEGRATED` | Combined mill, warehouse, job-work and trading under one roof |

### 2.2 Volume Profiles

| Profile | Typical Size | What matters most |
|---|---|---|
| **Solo / Startup** | 1–3 people, < 50 documents/month | Fast setup, guided flow, low cost |
| **Growing company** | 5–20 staff, 100–1,000 docs/month | Role management, import, reporting |
| **Established operator** | 20–100 staff, multi-shift, 1,000–10,000 docs/month | Warehouse zones, machine tracking, quality |
| **High-volume / Multi-site** | >100 staff, multiple locations | Site isolation, background jobs, PostgreSQL, SLA |

---

## 3. Plan Catalogue

> Prices are illustrative INR/month per company, excluding taxes and third-party provider fees.
> Confirm before accepting customers.

### 3.1 Standard Plans

| Plan | Price | Intended fit | Sites | Active staff | Docs/month |
|---|---|---|---|---|---|
| **Seed** | ₹499/month | Solo person or brand-new company | 1 | 2 | 300 |
| **Start** | ₹999/month | Small warehouse or early mill | 1 | 5 | 1,000 |
| **Grow** | ₹3,999/month | Established warehouse, mill or processor | 3 | 15 | 10,000 |
| **Scale** | ₹12,999+/month | High-volume or multi-site; scoped quote | Agreed | Agreed | Agreed |

### 3.2 What Each Plan Includes

| Feature | Seed | Start | Grow | Scale |
|---|---|---|---|---|
| Core operations (inward/outward/invoice) | ✅ | ✅ | ✅ | ✅ |
| Production / mill workflow | — | ✅ | ✅ | ✅ |
| Job work tracking | — | ✅ | ✅ | ✅ |
| Commerce desk (orders/catalogue) | ✅ | ✅ | ✅ | ✅ |
| CSV import (customers, items) | — | ✅ | ✅ | ✅ |
| Easy Bill / Tally connector | — | — | ✅ | ✅ |
| EWay Bill auto-generation | — | — | ✅ | ✅ |
| Webhook manager | — | — | ✅ | ✅ |
| Warehouse zones | — | — | ✅ | ✅ |
| Machine & quality management | — | — | ✅ | ✅ |
| HR & payroll | — | — | ✅ | ✅ |
| Multi-site / site isolation | — | — | — | ✅ |
| Dedicated deployment | — | — | — | ✅ |
| Migration rehearsal | — | — | — | ✅ |
| SLA / support contract | — | — | — | ✅ |
| Standard email support | ✅ | ✅ | ✅ | ✅ |
| Scheduled onboarding call | — | — | ✅ | ✅ |

### 3.3 Optional Add-ons (quoted separately)

| Add-on | Description |
|---|---|
| Historical balance import | Clean and reconcile opening stock/ledger from old records |
| Custom print formats | Branded invoice/challan templates in Tally Prime or EverGreen PDF |
| Operator training | On-site or remote guided training sessions |
| Deployment management | Server setup, backup automation, monitoring |
| Connector implementation | Custom API/webhook connector to a third-party system |
| Business card / QR profile | Digital business identity linked to company profile |

---

## 4. Unique Value to Low-Volume Customers

A newly started company or solo operator can:

1. **Start in GUIDED mode** — only essential screens are shown
2. **Enter first receipt in < 10 minutes** — no complex configuration
3. **Use Seed plan for < ₹500/month** — lower than most mobile ERP apps
4. **Import their existing customer list from Excel/CSV** — no re-entry
5. **Upgrade without losing any data or history**
6. **Export all their data at any time** — no lock-in

---

## 5. Unique Value to High-Volume Customers

Large operators that already use other software can:

1. **Migrate from Easy Bill, Tally, or a custom spreadsheet** via the connector/import wizard
2. **Sync in real-time via webhooks** — existing apps push events to EverGreen
3. **Keep their Tally Prime** for statutory filing; EverGreen handles operational tracking
4. **Get per-site stock isolation** — separate warehouse zones, machine tracking per location
5. **Enforce role-based access** — operators see only their screens; managers see reports
6. **Multi-shift payroll and HR** — integrated with production
7. **Quality quarantine** — hold stock lots pending inspection; block dispatch of held stock

---

## 6. Metering and Upgrade Rules

- A **posted document** = one successfully committed business document, counted once by its immutable ID
- Drafts, previews, API retries, login events, and webhook retries do NOT count
- Usage is measured per company per billing period on the server
- Show limits and projected usage in the admin dashboard before threshold is reached
- Warn at 80% of document limit; block new postings only after a grace window
- Price changes require an accepted commercial agreement — no silent auto-charges
- **Upgrading:** preserves all IDs, history, and customizations
- **Downgrading:** does not erase data; future-write restrictions apply after grace period
- **Cancelling:** read/export access continues according to contract; data export in documented formats

---

## 7. Licensing Architecture

### 7.1 Entitlement Structure (Target)

```
Entitlement {
  companyId: string        // Stable installation ID
  deploymentId: string     // Specific server/environment
  plan: 'SEED'|'START'|'GROW'|'SCALE'
  modules: string[]        // Enabled feature set
  sites: number            // Max warehouse/mill sites
  activeStaff: number      // Max concurrent active staff
  documentsPerMonth: number
  validUntil: Date
  gracePeriodDays: number
  signature: string        // Provider-signed; tamper-evident
  keyId: string            // Which signing key verified this
}
```

### 7.2 Enforcement Rules

- Entitlements are enforced **server-side at business-command boundaries**
- UI badges and labels reflect limits but do NOT enforce them (server is authoritative)
- Offline / desktop installations use signed entitlements with explicit renewal windows
- Company administrators cannot edit paid entitlements through Settings
- Provider signs entitlements; company cannot self-issue

### 7.3 Authorization vs Configuration vs Entitlement

| Concern | Controls | Managed by |
|---|---|---|
| **Authorization** | Who may perform an action | Roles (VIEWER / MODIFIER / ADMIN) |
| **Configuration** | What business activities the company does | Business mode, workspace mode in Settings |
| **Entitlement** | What was purchased | Provider-issued signed entitlement |

These three are separate and must never be conflated. A paid plan never permits access to another company's data.

---

## 8. Provider Admin Portal (Target)

The provider (you, as EverGreen's operator) manages customers through a **separate** portal:

```
Provider Portal
├── Company list (name, plan, deployment URL, renewal date)
├── Usage dashboard (docs posted, staff active, connector health)
├── Subscription management (create, upgrade, suspend, renew)
├── Support access (audited, time-limited, scoped per company)
├── Backup status and restore controls
└── Connector backlog and error review
```

Each company has its own data plane. The provider portal never silently impersonates company staff.
Support access is: audited, time-limited, requires company consent, and uses a distinct identity.

---

## 9. Migration Path for Existing Users

### 9.1 From Spreadsheets / No Software

```
1. Export contacts/items to CSV
2. Use Integrations → Import Data wizard (up to 500 rows per batch)
3. Enter opening stock via Inward Entry (as a "opening balance" batch)
4. Done — historical data preserved with source attribution
```

### 9.2 From Easy Bill

```
1. Export customers, items, invoices from Easy Bill
2. Use Integrations → Easy Bill Connector (planned) for automated mapping
3. Or use CSV import for customers and items
4. Historical invoices imported as read-only reference documents
```

### 9.3 From Tally Prime

```
1. Export Tally XML or CSV reports
2. Use Integrations → Tally Connector for ledger, stock group, item mapping
3. Opening balances reconciled in EverGreen
4. EverGreen handles operations; Tally used for statutory filing (optional coexistence)
```

### 9.4 EWay Bill Integration

```
1. Connect EWay Bill API credentials in Integrations → EWay Bill
2. On Outward Entry, system auto-generates e-way bill number
3. Bill number stamped on dispatch document and invoice
4. Cancellation flow linked to EWay Bill cancellation API
```

---

## 10. How to Share This Model

- Share this Markdown document or render it as a pricing page
- Keep the proposal status note at the top — do not present as a published contract
- Prices shown are starting points; confirm final pricing before customer commitments
- Customer data is exportable in documented formats
- Specific backup/exit deliverables belong in the customer agreement

---

*Document version: 2026-10-10. Updated from initial proposal to include all company types, volume tiers, unique differentiators, and migration paths.*

Status: product proposal for customer discussion, not an activated subscription system or a change to the source-code license. The owner has not confirmed open-source licensing. The repository currently has inconsistent historical license declarations (root package ISC, API UNLICENSED, old README MIT badge). Resolve ownership and publish one intended license before redistribution; this document grants no new software rights.

## What the customer buys

One company workspace for receipt → ownership-aware stock → processing → quality → dispatch → invoice → collection. Staff use the same operational records on browser and command display. Customers choose business activities and workspace complexity separately from their commercial plan. Warehouse-only or processing-only businesses should not pay for unused mill workflows.

The proposed differentiation is traceable handoffs: explain why stock cannot be dispatched, preserve the source of imported records, track who owns material, reconcile partial job-work returns and show recorded evidence beside the visual campus. These are product goals and selected implemented foundations, not a claim that competitors lack them.

## Proposed catalogue (prices require commercial validation)

Illustrative INR monthly prices per company, excluding applicable taxes and external provider fees. They are proposed starting points, not measured market prices or published offers.

| Plan | Proposed base | Intended fit | Included operating envelope | Services offered |
| --- | --- | --- | --- | --- |
| Start | ₹999/month | Individual or newly started business | 1 site, 3 active staff, 1,000 posted business documents/month | Guided setup, customer/item import, standard help guides, standard email support |
| Grow | ₹3,999/month | Established warehouse, mill or processor | 3 sites, 15 active staff, 10,000 posted documents/month | Assisted migration review, role setup, full workspace, scheduled onboarding |
| Scale | From ₹12,999/month, scoped quote | High-volume or multi-site operator | Agreed sites, staff, volumes and retention | Dedicated deployment options, migration rehearsal, connector project and support terms by contract |

Site limits, usage metering, subscription billing and connector entitlements are **not enforced in current code**. Multi-site costing/stock isolation is pending. Do not sell pending capabilities as delivered. The same data correctness and permission rules belong in every plan; stock reconciliation, export and basic audit access must not be premium-only safety features.

Optional services: fixed-scope data cleaning, historical balance reconciliation, custom print formats, operator training, deployment/backup management, and connector implementation. Quote external Tally/statutory-provider licenses separately. A business card/QR profile generator is optional future work and should not distract from core operations.

## Metering and upgrade rules (target contract)

- Define a posted document as a successfully committed business document, counted once by immutable ID. Drafts, previews, retry replays, login events and webhook retries do not consume business-document allowance.
- Measure usage per company and billing period on the server. Distinguish base price, added sites/users, metered add-ons, one-time migration work and third-party charges on the invoice.
- Show limits and projected usage before an upgrade. Warn at agreed thresholds. A price change requires an accepted commercial agreement; do not silently auto-charge overages.
- Upgrading preserves IDs, history and customizations. Downgrading does not erase data. Define grace periods and future-write restrictions explicitly; keep read/export access according to the contract.
- Offer monthly payment for early businesses and optional annual terms only after demonstrating adoption. Avoid unlimited promises before measuring support and infrastructure costs.

## Licensing architecture (pending)

Use a provider-issued entitlement containing company/deployment ID, plan, modules, usage envelope, validity, grace policy and signature/key ID. Enforce it server-side at business-command boundaries; UI badges cannot enforce a license. Offline installations need signed entitlements, explicit renewal windows and clock/replay handling. Company administrators cannot edit paid entitlements through Settings.

Keep authorization (who may act), business configuration (what the company does), and entitlement (what was purchased) separate. A paid plan never permits access to another company's data. See [architecture](ARCHITECTURE.md) for the provider portal boundary.

## How to share this model

Share this Markdown document or render it on a pricing page with its proposal status intact. No public site or external wiki has been published by these repository changes. Confirm final prices, service commitments and the intended source license before accepting customers under these terms. Customer data should remain exportable in documented formats; specific backup/exit deliverables belong in the customer agreement.
