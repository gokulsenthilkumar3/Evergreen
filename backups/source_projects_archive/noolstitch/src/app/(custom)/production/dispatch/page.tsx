import type { Metadata } from 'next';
import { JobWorkDispatchForm } from '@/components/custom/job-work-dispatch-form';

export const metadata: Metadata = {
  title: 'Dispatch Job Work | Noolstitch',
  description: 'Create a new Delivery Challan for job-workers',
};

export default function DispatchPage() {
  return (
    <main className="container-page py-section-lg">
      <header className="mb-10">
        <h1 className="font-display text-h1 text-foreground">Delivery Challan</h1>
        <p className="mt-2 text-body-lg text-muted-foreground">
          Issue raw materials to external job-workers for processing.
        </p>
      </header>

      <div className="mx-auto max-w-4xl">
        <JobWorkDispatchForm />
      </div>
    </main>
  );
}
