export interface DailySummaryEmailData {
  date: string;
  totalProductionKg: number;
  totalCost: number;
  lowStockItems: Array<{ name: string; available: number; uom: string }>;
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]!));

export function renderDailySummary(data: DailySummaryEmailData): string {
  const alerts = data.lowStockItems.length
    ? `<ul>${data.lowStockItems.map(item => `<li>${escapeHtml(item.name)}: ${item.available} ${escapeHtml(item.uom)}</li>`).join('')}</ul>`
    : '<p>No low-stock alerts.</p>';
  return `<h1>EverGreen daily summary — ${escapeHtml(data.date)}</h1><p>Production: ${data.totalProductionKg.toFixed(2)} kg</p><p>Total cost: ₹${data.totalCost.toFixed(2)}</p><h2>Stock alerts</h2>${alerts}`;
}
