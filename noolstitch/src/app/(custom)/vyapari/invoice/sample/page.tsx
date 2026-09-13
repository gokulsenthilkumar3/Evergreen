// @polsia:user-owned — /vyapari/invoice/sample. Static Server Component:
// renders a fully-populated sample invoice from literal data (no DB hit) so
// visitors can preview what Vyapari produces before filling in their own.
import type { Metadata } from 'next';
import Link from 'next/link';
import { InvoicePrintable } from '@/components/custom/invoice-printable';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { computeInvoiceLine, computeInvoiceTotals } from '@/lib/business/invoice-tax';
import type { InvoiceItem } from '@/lib/contracts/invoice';

export const metadata: Metadata = {
  title: 'Sample invoice',
  description:
    'Example Vyapari GST tax invoice — inter-state sale from Tiruppur to Bengaluru with 5% GST.',
  alternates: { canonical: '/vyapari/invoice/sample' },
};

// Build the sample from literal data so it roundtrips through the same
// compute pipeline the real form uses, byte-for-byte. A future flag flip to
// a dynamic sample just swaps this literal block for a Prisma read.
const SAMPLE_DATE = '2026-01-20';
const SAMPLE_CREATED = '2026-01-20T10:30:00.000Z';

const seller = {
  name: 'Tiruppur Knits Pvt Ltd',
  gstin: '33ABCDE1234F1Z5',
  state: 'Tamil Nadu',
  address: '12, Kumaran Road, Tiruppur — 641601',
};
const buyer = {
  name: 'Bengaluru Garments LLP',
  gstin: '29ABCDE1234F1Z5',
  state: 'Karnataka',
  address: '22, MG Road, Bengaluru — 560001',
};

const lines: Array<{
  description: string;
  hsnSac: string;
  qty: string;
  unitRate: string;
  gstRate: string;
}> = [
  {
    description: 'Cotton jersey fabric — 180 GSM',
    hsnSac: '5208',
    qty: '50',
    unitRate: '180',
    gstRate: '5',
  },
  {
    description: 'Ribbed cuff fabric — 220 GSM',
    hsnSac: '5208',
    qty: '20',
    unitRate: '240',
    gstRate: '5',
  },
];

function buildSample(): InvoiceItem {
  // Compute + format in a single derived pass per line so the result object
  // can be passed straight through to InvoiceItem without re-indexing.
  const rows = lines.map((line) => {
    const computed = computeInvoiceLine({
      qty: Number(line.qty),
      unitRate: Number(line.unitRate),
      gstRate: Number(line.gstRate),
      sellerState: seller.state,
      buyerState: buyer.state,
    });
    return {
      description: line.description,
      hsnSac: line.hsnSac,
      qty: line.qty,
      unitRate: line.unitRate,
      gstRate: line.gstRate,
      taxable: computed.taxable.toFixed(2),
      cgst: computed.cgst.toFixed(2),
      sgst: computed.sgst.toFixed(2),
      igst: computed.igst.toFixed(2),
      lineTotal: computed.lineTotal.toFixed(2),
    };
  });
  const totals = computeInvoiceTotals(
    rows.map((row) => ({
      split: seller.state === buyer.state ? ('CGST_SGST' as const) : ('IGST' as const),
      taxable: Number(row.taxable),
      cgst: Number(row.cgst),
      sgst: Number(row.sgst),
      igst: Number(row.igst),
      lineTotal: Number(row.lineTotal),
    })),
  );

  return {
    id: 'sample',
    sellerName: seller.name,
    sellerGstin: seller.gstin,
    sellerState: seller.state,
    sellerAddress: seller.address,
    buyerName: buyer.name,
    buyerGstin: buyer.gstin,
    buyerState: buyer.state,
    buyerAddress: buyer.address,
    invoiceNumber: 'INV-2026-0042',
    invoiceDate: SAMPLE_DATE,
    totalTaxable: totals.totalTaxable.toFixed(2),
    totalCgst: totals.totalCgst.toFixed(2),
    totalSgst: totals.totalSgst.toFixed(2),
    totalIgst: totals.totalIgst.toFixed(2),
    grandTotal: totals.grandTotal.toFixed(2),
    createdAt: SAMPLE_CREATED,
    items: rows.map((row, i) => ({
      id: `sample-${i}`,
      description: row.description,
      hsnSac: row.hsnSac,
      qty: row.qty,
      unitRate: row.unitRate,
      gstRate: row.gstRate,
      taxable: row.taxable,
      cgst: row.cgst,
      sgst: row.sgst,
      igst: row.igst,
      lineTotal: row.lineTotal,
    })),
  };
}

export default function VyapariInvoiceSamplePage() {
  const sample = buildSample();
  return (
    <main className="bg-muted/30 print:bg-white">
      <div className="no-print container-page py-section">
        <div className="mb-6">
          <p className="text-eyebrow text-muted-foreground">Vyapari · Sample</p>
          <h1 className="mt-2 font-display text-h2 text-foreground">
            What a Vyapari invoice looks like.
          </h1>
          <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
            Inter-state sale from Tiruppur (Tamil Nadu, GST state 33) to Bengaluru (Karnataka, GST
            state 29). Two fabric lines at 5% GST. Full 5% collected as IGST because the seller and
            buyer are in different states.
          </p>
        </div>
        <Separator className="mb-6" />
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/vyapari/invoice">Make your own invoice</Link>
          </Button>
        </div>
      </div>

      <InvoicePrintable invoice={sample} isSample />
    </main>
  );
}
