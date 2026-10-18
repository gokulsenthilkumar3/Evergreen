# EverGreen gate-to-accounts pilot plan

Based on the [code audit](audits/2026-10-11/GATE_WORKFLOW_AUDIT.md) and [moisture research](COTTON_MOISTURE_RESEARCH.md), 11 October 2026.

## Outcome and scope

Prove that a spinning mill can receive a cotton lot once, preserve its measurements, reconcile the supplier bill, and transfer accountant-approved vouchers into Tally without unexplained differences or duplicate entry. Start with one mill that buys ginned cotton bales and has an engaged accountant and weighbridge operator.

Keep EverGreen as the brand during validation. Treat cloud preference, market share, competitor weaknesses, CAC, churn, support salary, savings and willingness to pay in earlier proposals as unverified hypotheses. None is a release requirement.

## Prioritized backlog and acceptance criteria

| Order | Work | Acceptance evidence | Status |
| --- | --- | --- | --- |
| P0.1 | Saved measurements and policy-aware receipt | Original gross/tare/moisture retained; physical and billable quantities separate; invalid input rejected; duplicate retry creates one movement; actor recorded | First implementation completed in this change; field validation remains |
| P0.2 | Contract policy and quality decision | Accountant-approved, versioned method; premiums/dead bands/holds/rejection; wet-basis measurements and sample evidence; no silent default | Next |
| P0.3 | Link gate receipt to existing procurement | Reuse `LINK_COTTON_RECEIPT`, supplier bill/payment/allocation and journal paths; explain every quantity/amount difference; preserve original receipt on reversal | Next |
| P0.4 | Tally purchase export from approved bills | Exact supplier and company mappings, configured tax treatment, stable external voucher identity, balanced lines, rejected imports surfaced; test in a separate Tally company | Pending; inferred purchase export disabled |
| P0.5 | Six reliable Book-Ellam registers | Day Book from journal events, Inward/Outward from receipts/dispatches, Stock from movements/balances, Khata from party transactions, Machine Log from actual machine events; opening + movements = closing | Inward/outward route and receipt fixes completed; remaining mappings pending |
| P0.6 | Device and offline reliability | One actual indicator and moisture meter verified; authenticated device enrollment, protected key storage, signed event validation, sequence/replay controls, queue/restart replay and outage recovery | Agent is presently a simulation |
| P0.7 | Installation and support | Restore a tenant backup, validate tenant/provider separation, remove demo credentials, demonstrate Tamil task support, agree escalation owner | Required before unattended use |
| P1 | Lot quality, production/waste and operational exceptions | Trace pilot lots through existing production modules and reconcile yields/holds; measure actionable discrepancies | Extend after gate workflow passes |
| P2 | Statutory automation and wider commercial flows | Accountant-reviewed tax and document mappings; external-provider sandbox acceptance and reconciliation | Later |
| P3 | Additional 3D campus work | A measured user need beyond demo appeal and funded maintenance capacity | Deferred |

P0 means necessary to validate the focused product, not permission to promise every item today. Required compliance for a pilot transaction remains required regardless of the roadmap label.

## Four-week pilot, gated by evidence

**Week 1 — observe and baseline.** Product owner shadows the operator and accountant at one anchor mill; conduct three buyer interviews before generalizing. Collect anonymized examples only with the mill's authorization. Measure time per receipt, reconciliation time, repeated entry, disputes and actual support effort. Confirm procurement type, device models, network outages, Tally version/company and contract policy. Have the accountant approve worked calculation examples before settlement automation.

**Week 2 — shadow receiving.** Run the new receipt workflow beside the existing process. Target 20–30 lots if volume permits; extend the period if it does not. Compare gross, tare, sampled moisture, net stock and proposed settlement. Label manual capture accurately. Reconcile all differences daily; record explanations, not a presumed fraud total.

**Week 3 — close the accounting loop.** Link approved receipts to supplier bills using existing workflow records. Test invoice differences, partial/advance payments, credit adjustments and reversals. In a test Tally company, import one voucher, repeat it, disconnect during import and reconcile afterwards. File generation is not import success: retain the response and verify the resulting voucher/ledger balance. [Tally documents XML-over-HTTP and file integration](https://help.tallysolutions.com/integration-methods-and-technologies/); the currently implemented export does not complete that round trip.

**Week 4 — reliability and purchase decision.** Repeat common tasks without developer help; exercise a network outage, process restart and backup restore. The accountant reconciles the register and supplier balance; the owner reviews measured benefits and support hours. Ask for a paid continuation based on evidence. Obtain permission before publishing a testimonial or case study; do not invent one.

## Proposed exit criteria

These are pilot targets to agree with the mill, not externally established industry benchmarks:

- At least 30 real receipt reconciliations, or a longer pilot if volume is lower.
- No unexplained quantity or financial differences after review, and no duplicate stock/vouchers in retry scenarios.
- Every pilot lot traceable to measurements, actor, policy state and source reference.
- At least 30% median reduction in measured receiving-to-accounting effort versus the same mill's baseline; report sample size and exceptions.
- Accountant independently completes five consecutive normal transactions and one correction/reconciliation scenario.
- A backup restored and checked; outage queue replays without loss or duplicate posting before live device capture is marketed.
- Owner and accountant agree to paid continuation, with actual onboarding/support cost recorded.

Stop settlement automation for unexplained arithmetic, missing policy approval, mismatched Tally balances or lost evidence. Continue shadow measurement while correcting the issue. A moisture deduction is not automatically realized savings: count only an accepted, settled adjustment relative to the agreed baseline process.

## Unit-economics worksheet

Use observed values and gross profit, not subscription revenue alone:

```
CAC = attributable founder/sales time + travel + installation + acquisition expense
monthly contribution = collected subscription - hosting - support - channel and payment fees
payback months = CAC / monthly contribution
contribution LTV = monthly contribution × assumed paid lifetime
LTV:CAC = contribution LTV / CAC
```

Illustrative assumptions only: at ₹3,499/month, a 75% contribution margin and 18 paid months produce about ₹47,237 contribution LTV. With ₹40,000 CAC, that is 1.18× and 15.2 months payback. At ₹8,999 with the same assumptions it is about ₹1,21,487, 3.04× and 5.9 months. Neither scenario establishes a viable price. Include founder time and shared support allocation; avoid charging setup cost twice across CAC and onboarding costs. Annual prepayment improves cash timing, not automatically profitability. At these prices, test willingness to pay with the actual buyer rather than publishing a speculative price increase.

## Deployment decision

Keep a simple tenant installation for the first pilot. Compare same-region quotes for the same CPU/RAM/storage, backups, bandwidth and support requirements before choosing a cloud. No blanket GCP cost advantage is assumed. Keep portable application/container boundaries and defer Kubernetes until a measured need exists. The later [architecture decision](decisions/0001-installation-and-data-boundaries.md) records PostgreSQL per customer as the target; SQLite is still implemented, and conversion requires the EG-26 migration and reconciliation gates before rollout.

## Running this implementation

The new nullable `InwardBatch.weighbridgeReceipt` column requires migration before the updated API runs against an existing database. Review the migration and back up the target database; then apply the repository's normal `npm run migrate:deploy -w @evergreen/database` deployment procedure against the intended tenant. No customer database migration is performed by this task.

Build shared types and regenerate Prisma as normal. In Inward Entry, choose **Weighbridge receipt**. Leave the policy pending unless a confirmed contract supports the implemented deduction-only formula. Saved records appear in history and the existing QR/label dialog.

The API preserves a stable lot reference and timestamp across identical retries. Keep these unchanged after an uncertain save. Existing generic Add Batch remains available, without reconstructed historical moisture details. Purchase Tally export is intentionally unavailable until approved bill mapping is implemented; Sales/Receipt export requires ADMIN and still needs Tally acceptance testing.

## Verification (2026-10-11)

This is the original implementation evidence. Later migration checks and fixes are recorded in the [current validation record](PROJECT_AUDIT.md#validation-record); the historical failure below is not a current check result.

- Full API regression suite: 146 tests passed, including 29 receipt and export authorization cases.
- API/frontend TypeScript checks passed. Web production build passed with bundle-size warnings.
- The full SQL migration history applied to an in-memory SQLite database; a historical receipt retained its weight and NULL measurement snapshot, and the new snapshot round-trip passed.
- Repository-wide migration/schema comparison still fails on pre-existing `SystemSettings` licensing columns. The only new schema change here is the receipt column; the comparison reports no mismatch for it. Resolve the licensing migration gap before production deployment.
- Source-derived documentation and local link checks passed; the generator now preserves the existing curated Integrations operating guide.
- Receipt/register frontend tests: all 5 passed, including pending settlement, retry identity, contract-required deductions, register errors and authenticated XML download. Narrow icon imports eliminated the stalled test startup; the export tooltip now preserves the button's accessible name.
- No physical device, live Tally company or production deployment was used for these checks.
