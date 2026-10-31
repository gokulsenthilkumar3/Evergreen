export const defaultContacts = {
  salesEmail: "sales@evergreen.com",
  marketingEmail: "marketing@evergreen.com",
  licensingEmail: "licensing@evergreen.com",
  supportEmail: "support@evergreen.com",
  opensAt: "09:00",
  closesAt: "18:00",
  timeZone: "Asia/Kolkata",
};
export function safeContacts(input) {
  const next = { ...defaultContacts };
  if (!input || typeof input !== "object") return next;
  for (const key of [
    "salesEmail",
    "marketingEmail",
    "licensingEmail",
    "supportEmail",
  ])
    if (
      typeof input[key] === "string" &&
      /^[^\s<>:@]+@[^\s<>:@]+\.[^\s<>:@]+$/.test(input[key]) &&
      input[key].length <= 254
    )
      next[key] = input[key];
  if (
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.opensAt || "") &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.closesAt || "") &&
    input.closesAt > input.opensAt
  ) {
    next.opensAt = input.opensAt;
    next.closesAt = input.closesAt;
  }
  return next;
}
export const faults = {
  gate: {
    name: "Lot ID lost at the gate",
    nodes: ["receive", "make", "hold", "account"],
    consequence:
      "The opening quantity and supplier reference can no longer be checked against the later invoice.",
    owner: "Stock cannot be aged by the original lot with confidence.",
    accountant: "The billed quantity cannot be traced back to the receipt.",
    floor: "The next shift inherits material without its original identity.",
    missing: "Lot reference",
    ticket: "Receipt R-01 → lot reference absent",
  },
  jobwork: {
    name: "Job-work challan not reconciled",
    nodes: ["process", "hold", "deliver", "account"],
    consequence:
      "A partial return can be mistaken for a completed job while material remains with the processor.",
    owner:
      "Material and conversion charges remain committed without a reliable outstanding balance.",
    accountant:
      "The processor charge and returned quantity cannot be compared on the same reference.",
    floor: "A short return has no agreed baseline for follow-up.",
    missing: "Return against challan",
    ticket: "Challan J-01 → return comparison absent",
  },
  invoice: {
    name: "Invoice raised against the wrong batch",
    nodes: ["hold", "deliver", "account"],
    consequence:
      "The customer document points at a different physical handoff from the goods that left the mill.",
    owner:
      "An apparently completed sale can still need a correction or investigation.",
    accountant:
      "The customer, item and batch references must be checked before export.",
    floor: "A dispatch query sends the team back through packing records.",
    missing: "Batch / dispatch match",
    ticket: "Dispatch D-01 → invoice reference mismatch",
  },
};
export const stages = {
  receive: {
    title: "Receive",
    physical: "Material arrives at stores and is measured.",
    recorded:
      "Receipt date, supplier, quantity and the lot reference used by the business.",
    missing:
      "Without the opening record, a later quantity dispute has no baseline.",
    reference: "Process context: CottonWorks, fibre preparation for spinning.",
    url: "https://cottonworks.com/learning-hub/yarn-manufacturing/fiber-preparation-for-spinning/",
  },
  make: {
    title: "Make",
    physical:
      "A chosen spinning route prepares, cards, draws and spins fibre into yarn.",
    recorded: "Input consumption, output and waste for the production run.",
    missing:
      "Missing consumption or waste makes the mass balance difficult to reconcile.",
    reference:
      "CottonWorks describes preparation, carding, drawing and roving. Mill routes differ.",
    url: "https://cottonworks.com/learning-hub/yarn-manufacturing/fiber-preparation-for-spinning/",
  },
  hold: {
    title: "Hold",
    physical: "Material or yarn is held for processing or delivery.",
    recorded:
      "Quantity, movement, location and the relevant operational or catalogue identity.",
    missing:
      "A stock total alone does not identify the material that is available for an order.",
    reference:
      "Application scope: inventory and stock movements. Verify cross-module reconciliation with a test lot.",
    url: null,
  },
  process: {
    title: "Process",
    physical:
      "Material is issued to an external processor and returned partially or completely.",
    recorded:
      "Challan, party, issued quantity, return reference, scrap and outstanding quantity.",
    missing:
      "A return without its challan can hide an outstanding quantity or a short return.",
    reference:
      "Application scope: job-work issue and receipt. Verify units and partial returns in your own scenario.",
    url: null,
  },
  deliver: {
    title: "Deliver",
    physical: "Goods are allocated, packed and handed over for delivery.",
    recorded:
      "Customer, item, quantity and the saved order or dispatch reference.",
    missing:
      "A missing dispatch reference makes it harder to identify work that has not been billed.",
    reference:
      "Application scope: commerce and dispatch records. No universal automatic linkage is promised.",
    url: null,
  },
  account: {
    title: "Account",
    physical:
      "The business issues an invoice, allocates payments and prepares an export.",
    recorded:
      "Issuer, customer, date, item, amount, tax and payment references.",
    missing:
      "A wrong party or unbalanced amount can prevent a voucher from importing correctly.",
    reference:
      "Implementation reference: TallyService sales/receipt XML generation and automated regression tests. External TallyPrime import remains unverified.",
    url: null,
  },
};
export const narrativeSteps = [
  {
    title: "A lot arrives.",
    body: "The receipt is the first place the physical quantity and the supplier reference belong together.",
    record: "Receipt R-01",
    fields: [
      "Lot: EG-DEMO-001",
      "Supplier reference: example only",
      "Opening quantity: to be measured",
    ],
  },
  {
    title: "The gate record travels with it.",
    body: "The input record should be available when production records consumption and output.",
    record: "Production P-01",
    fields: [
      "Input: EG-DEMO-001",
      "Consumption: illustrative record",
      "Output and waste: compare before posting",
    ],
  },
  {
    title: "Stock needs a place.",
    body: "A movement records where the material went. A total without a location is still a question.",
    record: "Stock S-01",
    fields: [
      "Lot: EG-DEMO-001",
      "Location: example bay A",
      "Availability: not connected to live stock",
    ],
  },
  {
    title: "A challan leaves. A return must answer it.",
    body: "Compare issued and returned quantities. A partial return does not close the original handoff.",
    record: "Challan J-01",
    fields: [
      "Issue reference: J-01",
      "Return reference: J-01 / partial",
      "Outstanding: requires reconciliation",
    ],
  },
  {
    title: "Dispatch is a separate event.",
    body: "Keep the saved customer order and dispatch reference visible at the handoff.",
    record: "Dispatch D-01",
    fields: [
      "Customer: illustrative buyer",
      "Batch: EG-DEMO-001",
      "Packing reference: example only",
    ],
  },
  {
    title: "The invoice needs the right source.",
    body: "Check the customer, items, quantities and issuer details. Do not assume every legacy record is linked automatically.",
    record: "Invoice I-01",
    fields: [
      "Dispatch: D-01",
      "Party ledger: illustrative buyer",
      "Amounts: verify in the saved invoice",
    ],
  },
  {
    title: "The Tally export is a file.",
    body: "Preview, download, then review it in a test company. An export is not a successful import.",
    record: "Tally XML",
    fields: [
      "Format: application sales voucher",
      "Delivery: operator-reviewed file",
      "External import: not verified here",
    ],
  },
];
export function arithmetic({ invoices, value, days, rate }) {
  if (
    ![invoices, value, days, rate].every(Number.isFinite) ||
    !Number.isInteger(invoices) ||
    invoices < 0 ||
    invoices > 100000 ||
    value < 0 ||
    value > 100000000 ||
    days < 0 ||
    days > 365 ||
    rate < 0 ||
    rate > 100
  )
    return null;
  const monthly = invoices * value,
    capital = (monthly * days) / 30;
  return {
    monthly,
    capital,
    cost: (capital * rate) / 100,
    sensitivity: [0.5, 1, 1.5].map((factor) => ({
      days: days * factor,
      capital: (monthly * days * factor) / 30,
    })),
  };
}
export function makeBrief({
  mill = "",
  role = "Owner",
  goal = "",
  context = "",
}) {
  return `EverGreen specification brief\n\nMill: ${mill.trim() || "Not specified"}\nPerspective: ${role}\nWhat needs to make sense: ${goal.trim() || "Not specified"}${context.trim() ? `\nAdditional context: ${context.trim()}` : ""}\n\nReview request: demonstrate this workflow with our records before purchase.\nLocal draft. Nothing has been sent.`;
}
export const voucherLines = [
  [
    '<VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">',
    "Sales voucher element produced by the exporter.",
  ],
  ["  <DATE>20261101</DATE>", "Saved invoice date formatted as YYYYMMDD."],
  [
    "  <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>",
    "Voucher type selected by the sales exporter.",
  ],
  ["  <VOUCHERNUMBER>DEMO-001</VOUCHERNUMBER>", "Illustrative invoice number."],
  [
    "  <PARTYLEDGERNAME>Illustrative buyer</PARTYLEDGERNAME>",
    "Must match the customer ledger in the target company.",
  ],
  [
    "  <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>",
    "Accounting view used by the generated voucher.",
  ],
  [
    "  <ISINVOICE>Yes</ISINVOICE>",
    "Invoice indicator in the application format.",
  ],
  ["  <ALLLEDGERENTRIES.LIST>", "Customer ledger entry begins."],
  ["    <LEDGERNAME>Illustrative buyer</LEDGERNAME>", "Customer ledger name."],
  [
    "    <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>",
    "Debit-side convention used by the exporter.",
  ],
  [
    "    <AMOUNT>-10000.00</AMOUNT>",
    "Illustrative customer debit; review the sign.",
  ],
  ["  </ALLLEDGERENTRIES.LIST>", "Customer ledger entry ends."],
  ["  <ALLLEDGERENTRIES.LIST>", "Sales ledger entry begins."],
  [
    "    <LEDGERNAME>Cotton Yarn Sales</LEDGERNAME>",
    "Sales ledger used in the application exporter.",
  ],
  [
    "    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>",
    "Credit-side convention used by the exporter.",
  ],
  [
    "    <AMOUNT>10000.00</AMOUNT>",
    "Illustrative sales credit; balances the customer debit.",
  ],
  ["  </ALLLEDGERENTRIES.LIST>", "Sales ledger entry ends."],
  [
    "</VOUCHER>",
    "Voucher ends; the complete application download includes an envelope.",
  ],
];
