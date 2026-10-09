// @polsia:user-owned — /vyapari/invoice/[id] printable view (Server Component).
// Reads via the @/lib/server/invoice helper (kept under src/lib/** so the
// data-plane biome rule exempts it from the noRestrictedImports check; the
// page never imports @/lib/db directly). Renders InvoicePrintable.
// Force-dynamic so a stale static render can't pin a trader-shipped invoice
// to old data once the trader hits Save.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InvoicePrintable } from '@/components/custom/invoice-printable';
import { findInvoiceById, findInvoiceMetaById } from '@/lib/server/invoice';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = await findInvoiceMetaById(id);
  if (!meta) {
    return { title: 'Invoice not found' };
  }
  return {
    title: `Invoice ${meta.invoiceNumber}`,
    description: `Tax invoice from ${meta.sellerName} to ${meta.buyerName}.`,
    alternates: { canonical: `/vyapari/invoice/${id}` },
    robots: { index: false, follow: false },
  };
}

export default async function VyapariInvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await findInvoiceById(id);
  if (!invoice) {
    notFound();
  }

  return (
    <main className="bg-muted/30 print:bg-white">
      <InvoicePrintable invoice={invoice} />
    </main>
  );
}
