export const directions = {
  editorial: {
    name: "01 — The Ledger",
    effect: "sculpture",
    headline: [
      { text: "Every lot." },
      { text: "Every handoff." },
      { text: "One clear record.", emphasis: true },
    ],
    intro:
      "Material moves. People change shifts. The record should stay with the work.",
  },
  dimensional: {
    name: "02 — The Mill",
    effect: "webgl",
    headline: [{ text: "The mill." }, { text: "Connected.", emphasis: true }],
    intro:
      "A physical business deserves software that understands the handoffs.",
  },
  cinematic: {
    name: "03 — The Thread",
    effect: "sequence",
    headline: [{ text: "Follow" }, { text: "the thread.", emphasis: true }],
    intro:
      "From the first bale to the final invoice. Understand the work between them.",
  },
};
export const stageDetails = {
  inward: {
    title: "The record starts at the gate.",
    kicker: "01 / INWARD & LOTS",
    material: "Cotton enters the mill",
    data: "Receipt, supplier and quantity",
    value: "A purchase becomes stock",
    physical: "Raw material is received and measured before it enters stores.",
    record:
      "Receipt reference, supplier, date, quantity and lot identity. Record any agreed quality or moisture terms in your actual business workflow.",
    risk: "An unrecorded opening quantity makes later stock and supplier reconciliation difficult.",
    coverage:
      "Inward and inventory modules are implemented. Hardware capture and end-to-end lot linkage require workflow-specific verification.",
  },
  production: {
    title: "Fibre changes. Identity should not.",
    kicker: "02 / PRODUCTION",
    material: "Fibre becomes yarn",
    data: "Input, output and waste",
    value: "Conversion cost is committed",
    physical:
      "A carded ring-spinning route commonly proceeds through preparation, carding, drawing, roving, spinning and winding. Combed, rotor and other routes differ.",
    record:
      "Input batches, consumption, yarn output and waste. Review the mass balance for your production run.",
    risk: "Missing input or waste records make the output difficult to reconcile.",
    coverage:
      "Production recording is implemented. This process sketch is illustrative, not a live machine or digital-twin connection.",
  },
  stock: {
    title: "Available is a question, not a guess.",
    kicker: "03 / INVENTORY",
    material: "Yarn awaits its next step",
    data: "Movement and availability",
    value: "Capital is held in material",
    physical:
      "Produced or purchased goods are stored until needed for a dispatch or further processing.",
    record:
      "Stock movements, location and quantities, with the relevant catalogue or operational record.",
    risk: "Separate registers can disagree. A reservation or hold must be checked before promising delivery.",
    coverage:
      "Inventory and commerce stock views are implemented. Reconcile the operational and commerce paths used by your business.",
  },
  jobwork: {
    title: "Outside the mill. Still on the record.",
    kicker: "04 / JOB WORK",
    material: "Work moves to a partner",
    data: "Issue, return and outstanding",
    value: "Material and charges remain open",
    physical:
      "Material is issued to an external processor, then received back partially or completely.",
    record:
      "Processor, issue reference, issued quantity, returned output, scrap and outstanding balance.",
    risk: "A partial return can look complete if quantities and references are not compared.",
    coverage:
      "Job-work issue and receipt workflows are implemented. Confirm unit conversion and partial returns in your own scenario.",
  },
  dispatch: {
    title: "The handoff deserves a reference.",
    kicker: "05 / COMMERCE & DISPATCH",
    material: "Goods leave the mill",
    data: "Order and dispatch reference",
    value: "Stock becomes a customer commitment",
    physical:
      "Goods are allocated, packed and delivered according to a customer order.",
    record:
      "Customer, item, quantity and the saved order or dispatch document.",
    risk: "Unlinked dispatch and invoice records make it harder to detect work that has not been billed.",
    coverage:
      "Commerce and dispatch workflows are implemented. This diagram does not promise automatic reconciliation across every legacy record.",
  },
  invoice: {
    title: "A document you can trace back.",
    kicker: "06 / INVOICES & PAYMENTS",
    material: "The handoff becomes a bill",
    data: "Invoice, payment and export",
    value: "Receivable becomes collected cash",
    physical:
      "The business issues an invoice and records customer payments against it.",
    record:
      "Issuer, customer, item, amount, tax and payment allocation. Export complete Tally XML from the application.",
    risk: "Incorrect party mapping or unmatched totals can stop a voucher import or obscure an outstanding balance.",
    coverage:
      "Invoices, payments and Tally XML export are implemented. Statutory registration and automatic Tally posting require separate integrations.",
  },
};
export const roleReadings = {
  owner: {
    title: "“Where is my money sitting?”",
    body: "Read stock, outstanding job work and open invoices as separate commitments. Review the underlying record before treating a total as a decision.",
    nodes: ["stock", "jobwork", "invoice"],
  },
  accountant: {
    title: "“Does this reconcile?”",
    body: "Follow the saved receipt, dispatch, invoice and payment. Match dates, party ledgers and amounts before you import an export into Tally.",
    nodes: ["inward", "dispatch", "invoice"],
  },
  operations: {
    title: "“What should happen next?”",
    body: "Check material availability, record consumption and output, then reconcile the handoff to storage or the next processor. A missing record deserves attention before the next shift.",
    nodes: ["inward", "production", "stock", "jobwork"],
  },
};
export function billingModel({ invoices, value, days, annualRate }) {
  if (
    ![invoices, value, days, annualRate].every(Number.isFinite) ||
    !Number.isInteger(invoices) ||
    invoices < 1 ||
    invoices > 200 ||
    value < 0 ||
    value > 10000000 ||
    days < 0 ||
    days > 15 ||
    annualRate < 0 ||
    annualRate > 40
  )
    return null;
  const monthly = invoices * value;
  const capital = (monthly * days) / 30;
  return {
    capital,
    cost: (capital * annualRate) / 100,
    scenarios: ["Conservative", "Base", "Stretch"].map((name, index) => ({
      name,
      days: days * [0.5, 1, 1.5][index],
      capital: (monthly * days * [0.5, 1, 1.5][index]) / 30,
    })),
  };
}
export function buildBrief({
  mill = "",
  role = "Owner",
  goal = "",
  direction = "",
  effect = "",
}) {
  return `EverGreen demo brief\nBusiness: ${mill.trim() || "Not specified"}\nPerspective: ${role}\nGoal: ${goal.trim() || "Not specified"}\n\nDesign reference: ${direction}\nMotion reference: ${effect}\n\nLocal draft only. No message sent or appointment booked.`;
}
export function buildReview({ direction, effect, motion, notes = "" }) {
  const choice = Object.hasOwn(directions, direction)
    ? directions[direction]
    : directions.editorial;
  return `# EverGreen marketing design review\n\nPreferred direction: ${choice.name}\nMotion treatment: ${effect}\nMotion preference: ${motion}\n\n## Requested refinements\n${notes.trim() || "Add your feedback here."}\n\n## Approval scope\nDesign concept only. No publishing or replacement of the existing marketing homepage has been performed.\n\nAfter Effects asset: authoring script supplied; not an exported or rendered .aep project.`;
}
const guideEntries = [
  {
    words: ["tally", "xml", "export", "sync", "voucher"],
    answer:
      "The application exports Tally XML for an operator to review and import. This page shows an illustrative excerpt with annotations. Automatic posting is a separate integration.",
    section: "#integrations",
    label: "Source: Tally handoff →",
  },
  {
    words: ["offline", "licence", "license", "internet", "key", "host"],
    answer:
      "Access depends on a valid owner-signed activation and its offline deadline. The owner chooses the deployment and renews before expiry. Database encryption must be configured for the host; this demo does not certify it.",
    section: "#evidence",
    label: "Source: deployment and readiness →",
  },
  {
    words: [
      "animation",
      "effect",
      "3d",
      "2d",
      "motion",
      "adobe",
      "after",
      "film",
      "webgl",
    ],
    answer:
      "The motion desk compares SVG 2D, a four-layer CSS 3D spool, true WebGL and a play/scrub film study. The film preview is native browser motion; a separate authoring script can create a composition in After Effects.",
    section: "#main",
    label: "Source: motion desk →",
  },
  {
    words: ["privacy", "data", "send", "tracking", "ai", "groq", "scout"],
    answer:
      "This demo uses a local page guide, not a live model. Briefs and design reviews are copied or downloaded locally. No analytics or third-party requests are made. Only the non-identifying motion preference is stored.",
    section: "#guide",
    label: "Source: local guide and draft composer →",
  },
  {
    words: ["calculator", "saving", "capital", "formula", "roi", "billing"],
    answer:
      "The calculator estimates illustrative working capital released from fewer billing-delay days: monthly invoices × average value × days ÷ 30. It is not a revenue forecast or guaranteed saving.",
    section: "#calculator",
    label: "Source: visible model and sensitivity table →",
  },
  {
    words: [
      "ready",
      "implemented",
      "feature",
      "integration",
      "planned",
      "available",
    ],
    answer:
      "Read the readiness table for current implementation and setup requirements. CSV import/history and Tally XML export exist in the app; hardware, statutory and regional connections need separate validation. No customer savings are invented.",
    section: "#evidence",
    label: "Source: readiness and proof ledger →",
  },
  {
    words: ["cotton", "production", "spinning", "yarn", "mill", "process"],
    answer:
      "The schematic presents an illustrative business route from receipt through production, stock, job work, dispatch and invoice. Open a stage for its physical handoff, record, failure mode and implementation boundary.",
    section: "#flow",
    label: "Source: mill flow schematic →",
  },
];
export function findGuideEntry(question) {
  const words = String(question)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const ranked = guideEntries
    .map((entry) => ({
      entry,
      score: entry.words.filter((word) => words.includes(word)).length,
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score
    ? ranked[0].entry
    : {
        answer:
          "There is no verified answer for that question in this page guide. Inspect the readiness table or include the question in your demo brief. No generated answer has been substituted.",
        section: "#brief",
        label: "Prepare a demo brief →",
      };
}
