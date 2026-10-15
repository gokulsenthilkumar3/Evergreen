# Go-to-market

How EverGreen plans to reach its first customers in the Tirupur, Karur and Coimbatore textile cluster. This replaces the earlier GTM proposal and the "TareZero" pitch deck. Pricing is in the [commercial model](COMMERCIAL_MODEL.md), the pilot steps are in the [gate pilot plan](GATE_PILOT_PLAN.md), and the research method is in [long-term research](LONG_TERM_RESEARCH.md).

Everything here is a hypothesis to test. No customer interviews, outreach or sales have happened yet.

## Who we sell to

The long-term buyer is any textile business still running on paper, WhatsApp, Excel or memory: mills, traders, warehouses, job-work units and integrated operations. Screens must make sense to operators with limited literacy.

The first pilot targets one spinning mill that buys ginned cotton bales and has an engaged accountant and weighbridge operator.

## Why software sales stall in this cluster

- **The current way works well enough.** Mills have run on physical registers (day book, inward and outward books) and Tally for decades.
- **The accountant decides.** Anything that looks like it replaces Tally will be resisted.
- **Trust is low.** Many owners have paid for custom desktop ERPs that failed within months.

So the first offer is not "a new ERP". It is: **record each cotton receipt once, keep its measurements, and hand the accountant reconciled data, without replacing Tally.**

## Stakeholders

| Person | Concern | What we offer |
| --- | --- | --- |
| Head accountant (gatekeeper) | "Will this replace me or add data entry?" | Tally stays the book of accounts. EverGreen prepares reviewed vouchers so receipts are not re-typed |
| Mill owner / MD (decision maker) | "Another vendor who promises everything and disappears" | A small paid pilot with a measured baseline and written exit criteria |
| Weighbridge operator (daily user) | "Must be faster than the register and run on the gate PC" | Guided receipt entry now; direct indicator capture and label printing once the hardware work passes acceptance |

## Pilot shape

1. **Discovery.** Visit mills and shadow the weighbridge operator and accountant to learn the real receipt and settlement process.
2. **Anchor pilot.** Run EverGreen next to the paper register at one mill for four weeks, gated by the evidence in the pilot plan.
3. **Measure.** Compare receipts, moisture settlement and accountant time against the register. Report the differences we found, not projected savings.
4. **Expand.** Present results to mill associations only after the anchor mill agrees the numbers are right.

## Claims we must not make yet

Earlier material made promises the product cannot yet back up. Until the matching gate in the [backlog](IMPLEMENTATION_BACKLOG.md) passes, do not claim:

- Fraud prevention, "hardware-locked" weights or tamper-proof slips. The weighbridge agent is a simulation today (INT-006).
- Specific savings per truck, payback periods or "pay nothing if we don't save ₹1 lakh" guarantees.
- A universal "SIMA/CCI moisture standard". Moisture terms vary by contract (see [cotton moisture research](COTTON_MOISTURE_RESEARCH.md)).
- One-click Tally purchase vouchers. Only sales and receipt export exists, and it still needs status filtering and ledger mapping (INT-001, INT-002).
- Automatic WhatsApp collections. Today the app builds `wa.me` links that a person sends (INT-005).
- "100% isolation", "bank-grade encryption" or a guaranteed SLA. Isolation and recovery have not been proven by deployment evidence (SEP-004, REL-005).
- Instant reactivation after payment. Saving a license in the provider portal does not confirm the customer installation applied it (EG-02).

The marketing site still uses several of these claims. See the [15 October report](audits/2026-10-15/REPORT.md).
