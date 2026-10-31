export function materialBalance(input, waste, downtime) {
  if (![input, waste, downtime].every(Number.isFinite) || input < 100 || input > 5000 || waste < 0 || waste > 20 || downtime < 0 || downtime > 4) return null;
  const hours = 8 - downtime;
  const processed = (input * hours) / 8;
  const discarded = (processed * waste) / 100;
  return { input, hours, processed, yarn: processed - discarded, waste: discarded, unused: input - processed };
}
export const stages = [
  { symbol: '↘', label: '01 / INWARD', title: 'A clear beginning changes everything.', text: 'Start with the supplier, receipt and received quantity. Give the next person a record they can check.', next: 'Stores can reconcile the quantity before issuing material.', stamp: 'RECEIVED', status: 'Receipt attached', gap: 'Without a receipt, stores cannot confirm the source quantity. Review it before issuing material.' },
  { symbol: '◎', label: '02 / MATERIAL CONTEXT', title: 'Understand what you are working with.', text: 'Bring the agreed quality terms and material references into the conversation. Inspection procedures depend on the mill and product.', next: 'Production can review the material context before choosing the processing route.', stamp: 'REVIEW', status: 'Sample terms recorded', gap: 'Missing quality context needs review. This demo does not validate fibre quality or connect to a laboratory.' },
  { symbol: '≋', label: '03 / PRODUCTION', title: 'A transformation worth understanding.', text: 'Record the inputs, output and waste for a run. The shape of the material changes; its quantities still need to add up.', next: 'Stock receives the recorded output. Accounts reviews the input and waste balance.', stamp: 'PROCESSED', status: 'Sample run recorded', gap: 'A missing input reference prevents confident reconciliation. It is not fixed by changing the output total.' },
  { symbol: '▦', label: '04 / STOCK & JOB WORK', title: 'Outside the process. Still in the picture.', text: 'Review stock movements, material issued to processors, returns and outstanding quantities before promising the next handoff.', next: 'The team checks availability, outstanding work and any holds before preparing dispatch.', stamp: 'ON RECORD', status: 'Movement referenced', gap: 'A missing issue reference leaves returns unexplained. Review the processor record before closing the balance.' },
  { symbol: '↗', label: '05 / DELIVERY & ACCOUNTS', title: 'Carry the record all the way through.', text: 'Review the order, dispatch and invoice together. Prepare the accounting handoff with the people who own the ledgers.', next: 'An operator checks ledger mapping and imports the validated XML into Tally.', stamp: 'PREPARED', status: 'Invoice referenced', gap: 'Missing dispatch context needs confirmation before invoicing. No shipment or payment is executed in this demo.' },
];
export const markets = [
  { name: 'India', check: 'Confirm GST configuration and ledger mapping.' },
  { name: 'Vietnam', check: 'Validate local invoicing and customs export.' },
  { name: 'China', check: 'Scope operational records and site hosting.' },
  { name: 'Malaysia', check: 'Staff training and equipment validation.' },
  { name: 'Singapore', check: 'Catalogue and cross-border commercial handoffs.' },
];
export const guides = {
  material: 'Local explanation: input equals yarn output plus recorded waste plus unprocessed material across eight planned hours. Use sliders to inspect arithmetic.',
  tally: 'Local explanation: the Tally panel shows an XML excerpt and field mapping. Operators review complete export before import into Tally.',
  demo: 'Local explanation: start with one workflow, the people who use it and one question to resolve. Use “Shape your demo” to download a discovery brief. It stays local until you choose to share it.',
};
export function localGuide(question) {
  const q = String(question || '').toLowerCase();
  if (/tally|xml|ledger|account/.test(q)) return guides.tally;
  if (/material|yarn|waste|balance|shift|hour/.test(q)) return guides.material;
  if (/demo|prepare|brief|start/.test(q)) return guides.demo;
  return 'This local preview has no verified explanation for that question. Try material balance, Tally, or preparing a demo. No AI model is connected and nothing was sent.';
}
export function createBrief({ mill, role, market, question }, balance, waste, downtime) {
  const company = (mill && mill.trim()) || 'Not supplied';
  const roleText = role || 'Leadership';
  const marketText = market || 'India';
  const note = (question && question.trim()) || 'To discuss';
  return `EverGreen / Genesis Atelier — discovery brief\n\nCompany: ${company}\nPerspective: ${roleText}\nMarket: ${marketText}\nQuestion: ${note}\n\nIllustrative scenario\nInput: ${balance.input} kg\nWaste rate: ${waste}%\nInterruption: ${downtime} hours\nOutput: ${balance.yarn} kg\nUnprocessed: ${balance.unused} kg\n\nValidate language, local invoicing, migration, hosting, training and integration requirements. International compliance and machine connectivity are not certified by this demo.\n\nLocal draft only. No enquiry sent, no appointment booked, no AI call made.\n`;
}