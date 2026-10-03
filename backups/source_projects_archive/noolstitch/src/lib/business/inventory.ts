// @polsia:user-owned — Inventory business logic
export function computeInwardLine(params: { qtyReceived: number; unitCost: number }) {
  const lineTotal = params.qtyReceived * params.unitCost;
  return {
    ...params,
    lineTotal,
  };
}

export function computeInwardEntryTotals(lines: { lineTotal: number }[]) {
  const totalValue = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { totalValue };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
