// @polsia:user-owned — /vyapari/invoice form. Wraps InvoiceForm (the client
// island) in a Server-page layout. We export `metadata` here (so title/OG are
// SEO-friendly) but the page itself has no body data fetching — the form
// fetches nothing on mount, the merchant simply types.
import type { Metadata } from 'next';
import { InvoiceForm } from '@/components/custom/invoice-form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Vyapari invoice generator',
  description:
    'Generate GST-ready tax invoices for Indian textile trade. CGST/SGST (intra-state) or IGST (inter-state) are computed in real time and persisted to Postgres.',
  alternates: { canonical: '/vyapari/invoice' },
};

export default function VyapariInvoiceFormPage() {
  return (
    <main className="container-page py-section-lg">
      <header className="mb-10">
        <Badge variant="secondary" className="mb-4 gap-1.5 text-caption">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Vyapari · GST invoicing
        </Badge>
        <h1 className="font-display text-h1 text-foreground">New tax invoice</h1>
        <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
          Capture seller + buyer, add line items, and the totals — taxable value, CGST/SGST or IGST,
          grand total — update as you type. Saved invoices land at a printable URL you can email,
          share, or use as a paper copy.
        </p>
      </header>

      <Separator className="mb-10" />

      <InvoiceForm />
    </main>
  );
}
