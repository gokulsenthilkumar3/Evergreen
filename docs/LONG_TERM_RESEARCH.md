# Long-term product and technical research

Research checked on 2026-10-14. This separates external facts from EverGreen-specific hypotheses. Sources describe their own products/technologies; they do not establish demand for EverGreen. No customer interviews, outreach, purchases or deployments were performed.

## Recommended initial business focus

Test a paid single-company pilot for cotton/yarn receipt-to-settlement and stock-to-collection, with assisted onboarding and Tally coexistence. This is an inference from the current operational code and the existing [gate pilot plan](GATE_PILOT_PLAN.md), not validated market demand.

A useful initial promise is an accepted receipt and reconciled handoff with traceable exceptions. Avoid selling a broad autonomous ERP, guaranteed fraud prevention, multi-site isolation or statutory automation until the corresponding implementation gates pass.

## Primary-source findings

| Source checked | What it supports | Implication for EverGreen |
| --- | --- | --- |
| [SQLite isolation](https://www.sqlite.org/isolation.html) | Writes are serialized; WAL allows readers alongside a writer, not multiple concurrent writers | Measure write duration and lock contention before changing databases. Repeated reconciliation can dominate a posting. |
| [SQLite backup API](https://www.sqlite.org/backup.html) | An online backup API and VACUUM INTO can produce a consistent snapshot | An ordinary copy of a live main DB file is not a recovery strategy. Restore and reconcile a new isolated target. |
| [Prisma transactions](https://www.prisma.io/docs/orm/fundamentals/transactions) | Transactions, concurrency control and idempotent API design have explicit trade-offs | Keep stock invariants atomic, constrain transaction time and make replay semantics command-specific. Current repo uses Prisma 5.22; check version compatibility before adopting newer examples. |
| [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Least privilege, deny by default, per-request checks and authorization tests | A tenant sync credential must not inherit provider administration access. Test wrong-company IDs as well as roles. |
| [Tally XML integration](https://help.tallysolutions.com/xml-integration/) | XML over HTTP has request/response structures and gateway prerequisites | Persist acknowledgement and reconciliation; exporting a file is not successful accounting integration. |
| [Tally format/version support](https://help.tallysolutions.com/import-data-from-xml-or-json/) | Current guidance distinguishes JSON support in 7.0 from earlier XML/Excel support | Record the customer's installed version. Do not promise JSON support to every Tally installation. |
| [Zoho Books India pricing](https://www.zoho.com/in/books/pricing/) | Existing accounting offers include invoicing, inventory and reconciliation; Standard shows INR 899 monthly or INR 749/month billed annually, excluding local taxes | Basic invoicing alone is a weak differentiation hypothesis. Benchmark the textile handoff, implementation effort and support instead. Recheck prices before any proposal. |
| [ERPNext pricing](https://frappe.io/erpnext/pricing) | Provides a primary comparison point for ERP delivery/hosting options | Compare total deployment, customization and support scope; avoid assuming that a software price equals operating cost. |

These facts support engineering and discovery choices, not a claim that EverGreen is faster, cheaper or superior to a competitor.

## Discovery plan: first four weeks

| Week | Work | Evidence to retain | Decision |
| --- | --- | --- | --- |
| 1 | Observe 5 operators and speak with 3 buyers across mill, warehouse and trader workflows | Existing receipt/invoice/collection steps, anonymized examples, minutes per handoff, reconciliation disputes and current software | Choose one segment and one recurring costly problem |
| 2 | Walk through a disposable dataset and agree a bounded pilot | Time to first accepted receipt, task errors, training/support time, buyer's success criteria | Proceed only if the product can close the identified gap |
| 3 | Run the pilot with reconciliation and recovery controls | Accepted operational records, rejected/duplicate attempts, support effort, buyer feedback | Fix core friction before adding modules |
| 4 | Ask buyer to choose paid continuation against actual scope | Quote acceptance/rejection, reason, contribution economics and unresolved blockers | Continue, narrow or stop the offer based on evidence |

These are proposed research sample sizes and milestones. Do not report interviews as completed. Owner or an explicitly authorized delegate conducts outreach; the repository stores only consented, minimized research notes.

Ask for the last real incident rather than abstract feature preferences: “Show how the last disputed receipt was settled,” “Where was material waiting on an unclear status?” and “Which reconciliation made you reopen yesterday's accounts?” Separate operator pain from the budget owner's purchase criteria.

## Experiments and stop rules

| Hypothesis | Proposed experiment | Advance when | Reconsider when |
| --- | --- | --- | --- |
| Receipt reconciliation is the best entry point | Compare 20 consecutive receipts to the buyer's agreed baseline | Reduced reconciliation effort with accurate accepted quantities and no hidden re-entry | The operator still duplicates every entry without measurable benefit |
| Tally coexistence eases adoption | Export/import a representative test batch and reconcile vouchers | Buyer/accountant accepts the mapping and error workflow | Integration/support cost exceeds the value of the pilot |
| Guided setup improves activation | Observe unassisted receipt entry after initial company setup | Operator completes the agreed task and can recover from a validation error | Founder intervention is required for most records |
| Paid support/onboarding is viable | Track all time, travel, hosting and support for a paid pilot | Collected contribution meets the owner's target and renewal is plausible | Unpriced custom work dominates every installation |
| Device integration creates value | Compare manual and real device capture with calibration evidence | Faster accepted capture, fewer transcription errors and auditable overrides | Failure/recovery burden exceeds measured savings |

A moisture deduction is not automatically a saving. Count only accepted, settled adjustments against the agreed baseline and contract; retain physical net weight separately.

## Commercial measurement

Monthly contribution = collected recurring fees minus hosting, storage/backups, payment/channel fees and support delivery cost. Acquisition cost includes attributable sales/founder time, travel and installation effort not separately recovered. Payback = acquisition cost divided by positive monthly contribution. If contribution is zero or negative, report payback as undefined.

Track time to first accepted receipt, weekly active operators, posting success/duplicate rates, reconciliation exceptions, support minutes per company, recovered backup age, accepted payment and renewal. Report customer counts and time windows with every rate. Small pilot samples are directional, not market-wide forecasts.

The [commercial proposal](COMMERCIAL_MODEL.md) remains a proposal. Do not publish a price as validated or include unfinished integrations in a paid commitment.

## Technical research queue

1. Profile posting/reconciliation across 1k/10k/100k movement datasets; compare query count, p95/p99 and lock failures before and after the planned PostgreSQL conversion. PostgreSQL per customer is already the [recorded target](decisions/0001-installation-and-data-boundaries.md); these measurements inform migration acceptance and transaction design.
2. Profile list/history reads and 3D/print/export imports on the intended operator machine. Keep animation separate from availability of business records.
3. Verify Tally mapping and protocol for the installed version, then external acknowledgements and duplicate recovery.
4. Test actual devices and power/network loss before changing a simulation label to live capture.
5. Rehearse backup, migration and rollback before optimizing operational automation.
6. Review tax/provider rules with the actual provider and relevant professional before statutory integrations. No legal-compliance certification is made here.

Forecasting and predictive maintenance are deferred until historical completeness, clear targets and decision value are established. Any later model project needs a separate evaluation and monitoring plan.

## Continuing cadence

Every week, review pilot exceptions and the top three recurring support costs. Every month, recheck dependency advisories, restore evidence, performance trends and unresolved architecture decisions. Every quarter, revisit competitor offerings, prices, buyer feedback and the roadmap. Recheck time-sensitive sources before a commercial commitment even if their scheduled review is not due.

Record date, source, observed fact, hypothesis, next experiment, owner, evidence and decision in the [implementation record](IMPLEMENTATION_BACKLOG.md). Retire hypotheses that failed; do not preserve them as features merely because they appear in an old plan.
