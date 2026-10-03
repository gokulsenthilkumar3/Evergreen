export function computeTotalQty(lines: { qtyDispatched?: string; qtyReceived?: string }[]) {
  let total = 0;
  for (const line of lines) {
    total += Number(line.qtyDispatched || line.qtyReceived || 0);
  }
  return total.toFixed(2);
}

export function computeTotalScrap(lines: { scrapQty?: string }[]) {
  let total = 0;
  for (const line of lines) {
    total += Number(line.scrapQty || 0);
  }
  return total.toFixed(2);
}
