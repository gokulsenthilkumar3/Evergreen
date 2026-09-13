// @polsia:user-owned — server-only helpers for the Vyapari invoice resource.
// Lives under `src/lib/**` so the biome data-plane override exempts it from
// the noRestrictedImports check (the page that imports THIS module is a
// Server Component and only sees the typed return shape, never the prisma
// singleton). The contract-shaped return value is validated against
// InvoiceItem so a schema change breaks the print page at tsc.
import { InvoiceItem } from '@/lib/contracts/invoice';
import { prisma } from '@/lib/db';

function decimalString(n: unknown): string {
  if (typeof n === 'string') return Number(n).toFixed(2);
  if (typeof n === 'number') return n.toFixed(2);
  if (n && typeof (n as { toFixed?: unknown }).toFixed === 'function') {
    return (n as { toFixed: (d: number) => string }).toFixed(2);
  }
  return '0.00';
}

export async function findInvoiceById(id: string): Promise<(typeof InvoiceItem)['_output'] | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) return null;

  return InvoiceItem.parse({
    id: invoice.id,
    sellerName: invoice.sellerName,
    sellerGstin: invoice.sellerGstin,
    sellerState: invoice.sellerState,
    sellerAddress: invoice.sellerAddress,
    buyerName: invoice.buyerName,
    buyerGstin: invoice.buyerGstin,
    buyerState: invoice.buyerState,
    buyerAddress: invoice.buyerAddress,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    totalTaxable: decimalString(invoice.totalTaxable),
    totalCgst: decimalString(invoice.totalCgst),
    totalSgst: decimalString(invoice.totalSgst),
    totalIgst: decimalString(invoice.totalIgst),
    grandTotal: decimalString(invoice.grandTotal),
    createdAt: invoice.createdAt.toISOString(),
    items: invoice.items.map((it) => ({
      id: it.id,
      description: it.description,
      hsnSac: it.hsnSac,
      qty: it.qty.toString(),
      unitRate: it.unitRate.toString(),
      gstRate: it.gstRate.toString(),
      taxable: decimalString(it.taxable),
      cgst: decimalString(it.cgst),
      sgst: decimalString(it.sgst),
      igst: decimalString(it.igst),
      lineTotal: decimalString(it.lineTotal),
    })),
  });
}

export async function findInvoiceMetaById(
  id: string,
): Promise<{ invoiceNumber: string; sellerName: string; buyerName: string } | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { invoiceNumber: true, sellerName: true, buyerName: true },
  });
  return invoice;
}
