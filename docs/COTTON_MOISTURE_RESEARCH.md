# Cotton moisture: research and implementation decision

Researched 11 October 2026. The product needs the supplier's actual terms, not one universal cotton deduction constant.

## What primary sources establish

| Source | Finding | Product implication |
| --- | --- | --- |
| [CAI–CITI model cotton contract](https://www.caionline.in/uploads/front_pdf/FINAL%20CAI-CITI%20MODEL%20COTTON%20CONTRACT.pdf), sections 1, 3, 6.6 and 7 | The model uses a 9% moisture base. It specifies deductions up to 10.5%, rejection above that, and premium bands below the base. It allows mutually agreed base terms; adjustments can change with the association's value differences. Probe sampling covers an average of 20% of bales. | Best starting discussion document for a spinning mill buying ginned bales. It does not establish that a specific mill adopted it, nor settle the exact arithmetic/rounding of a software implementation. |
| [CCI 2025–26 procurement terms](https://www.cotcorp.org.in/WriteReadData/Downloads/24%2045%203728GP%20Tender%20Notice%20Dt.18.10.2025.pdf), appended MSP notification | Kapas procurement uses an 8% base, proportional price adjustment and a 12% ceiling for the specified procurement operation. | Kapas is seed cotton. Do not transplant this policy into all spinning-mill bale contracts. This is a season-specific document, not verification of 2026–27 policy. |
| [CCI ready-bale purchase terms, 2022–23](https://www.cotcorp.org.in/Writereaddata/Downloads/Ready%20bales%20terms%20and%20conditions%202022-23.pdf) | This historical contract uses an 8% allowance, stepped value deductions and rejection above 9.5%. | Even the same institution uses context-specific terms. These historical conditions are evidence of variation, not a recommended current rule. |
| [CCI Guntur auction terms, 24 February 2025](https://cotcorp.org.in/WriteReadData/PDF/40%2016%205357open-auction%20dated%2024-02-2025.pdf) | This sale specifies sampling, discounts above 9% and premiums below 7%, using net delivery weight and sale rate. | Purchase versus sale terms and sampling procedure matter; a deduction-only engine does not implement every contract. |

## Moisture content and regain differ

Moisture content expresses water relative to wet/as-received weight; regain expresses water relative to dry weight. The measurement basis must be stored alongside the reading. The distinction is supported by the experimental definition of regain in this [cotton measurement study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10611317/).

Derivation: if dry weight is D and water is W, content = 100W/(D+W), while regain = 100W/D. Therefore 8.5% regain corresponds to approximately 7.83% moisture content. An 8.5% number cannot safely be used without knowing its basis. The new receipt form explicitly accepts moisture **content** only.

## Recommended default and implemented rule

Default: **pending contract confirmation**. Save the actual measurements and physical receipt; leave settlement weight and moisture deduction null. Pending is not zero deduction, a quality release, a payable, or an invoice.

Supported optional policy: **agreed excess percentage deduction**, selected explicitly with a baseline and contract reference:

```
physical net kg = gross kg - tare kg
deduction kg = round(net kg × max(0, measured content - agreed base) / 100, 2)
billable kg = round(net kg - deduction kg, 2)
```

Example only: gross 14,520 kg, tare 4,200 kg, measured 9.2%, contract base 8.5% yields physical 10,320 kg, deduction 72.24 kg and billable 10,247.76 kg. The 8.5% here is a test fixture, **not** a recommended statutory or association baseline. This policy has no premium or rejection rule, so it is not the full CAI–CITI model contract.

Alternative dry-matter normalization, derived from conservation of dry cotton, would use `net × (100 - measured content)/(100 - target content)`. For the same numbers that yields approximately 10,241.05 kg. It is a different formula with different commercial consequences and is not implemented or claimed to govern Indian bale purchases.

Physical inventory stays at the measured net weight. Deductions affect settlement; actual drying loss belongs in subsequent stock/production accounting.

## Pilot evidence needed before settlement automation

Obtain three recent supplier contracts and their corresponding weighbridge slips, sampled moisture records, invoices and settlement calculations. Have the accountant and purchasing owner walk through at least one above-base, below-base and disputed lot. Confirm:

- Material: kapas or ginned lint bales; included packaging and other deductions.
- Wet-basis content versus dry-basis regain, instrument, calibration, bale selection, sampling depth and aggregation method.
- Contract base, dead band, premium, rejection/hold threshold and governing contract date/version.
- Exact formula, rounding stages, price unit and agreed kg conversion for any candy/quintal rate.
- Whether adjustments change invoice quantity, commercial discount, debit note or some other approved accounting entry.
- Who approves a discrepancy, how the supplier accepts it, and how a correction is reversed without destroying the original receipt.

Do not infer fraud from a moisture difference alone. Record a discrepancy until investigation and agreement establish its cause and financial outcome.
