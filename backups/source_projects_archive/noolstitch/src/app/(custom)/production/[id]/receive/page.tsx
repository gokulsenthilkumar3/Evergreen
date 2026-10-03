import type { Metadata } from 'next';
import { JobWorkReceiptForm } from '@/components/custom/job-work-receipt-form';

export const metadata: Metadata = {
  title: 'Receive Job Work | Noolstitch',
  description: 'Receive processed goods from job-workers',
};

export default function ReceivePage({ params }: { params: { id: string } }) {
  return (
    <main className="container-page py-section-lg">
      <header className="mb-10">
        <h1 className="font-display text-h1 text-foreground">Receive Goods</h1>
        <p className="mt-2 text-body-lg text-muted-foreground">
          Log receipt of processed materials against this challan.
        </p>
      </header>

      <div className="mx-auto max-w-4xl">
        <JobWorkReceiptForm challanId={params.id} />
      </div>
    </main>
  );
}
