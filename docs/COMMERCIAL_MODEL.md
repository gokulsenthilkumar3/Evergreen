# Licensing, pricing and commercial model

Reviewed on 2026-10-15. Earlier contradictory feature and pricing tables have been consolidated into this proposal.

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

