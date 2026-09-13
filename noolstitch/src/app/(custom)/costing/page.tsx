import type { Metadata } from 'next';
import { CostingForm } from '@/components/custom/costing-form';

export const metadata: Metadata = {
  title: 'Costing | Noolstitch',
  description: 'Create a new garment costing sheet',
};

export default function CostingPage() {
  return (
    <main className="container-page py-section-lg">
      <header className="mb-10">
        <h1 className="font-display text-h1 text-foreground">Costing Sheet</h1>
        <p className="mt-2 text-body-lg text-muted-foreground">
          Estimate the total cost of a garment style before production.
        </p>
      </header>

      <div className="mx-auto max-w-4xl">
        <CostingForm />
      </div>
    </main>
  );
}
