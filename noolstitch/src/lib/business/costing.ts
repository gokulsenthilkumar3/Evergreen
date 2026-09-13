import type { z } from 'zod';
import type { CostingComponentSchema } from '../contracts/costing';

export function computeCostingComponent(qty: string | number, rate: string | number): string {
  const amount = Number(qty || 0) * Number(rate || 0);
  return amount.toFixed(2);
}

export function computeCostingTotals(components: z.infer<typeof CostingComponentSchema>[]) {
  let totalMaterialCost = 0;
  let totalProcessCost = 0;
  let totalOverheads = 0;

  for (const comp of components) {
    const amount = Number(computeCostingComponent(comp.qty, comp.rate));
    if (comp.type === 'MATERIAL') totalMaterialCost += amount;
    else if (comp.type === 'PROCESS') totalProcessCost += amount;
    else if (comp.type === 'OVERHEAD') totalOverheads += amount;
  }

  const grandTotal = totalMaterialCost + totalProcessCost + totalOverheads;

  return {
    totalMaterialCost: totalMaterialCost.toFixed(2),
    totalProcessCost: totalProcessCost.toFixed(2),
    totalOverheads: totalOverheads.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
  };
}

export function formatCurrency(amount: string | number): string {
  return `₹${Number(amount || 0).toFixed(2)}`;
}
