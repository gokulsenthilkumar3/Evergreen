// @polsia:user-owned — Inward Entry page
import type { Metadata } from 'next';
import { InwardEntryForm } from '@/components/custom/inward-entry-form';

export const metadata: Metadata = {
  title: 'Receive Stock',
};

export default function InwardEntryPage() {
  return (
    <main className="container-page py-section-lg">
      <header className="mb-10">
        <h1 className="font-display text-h1 text-foreground">Inward Entry (Receive Stock)</h1>
        <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
          Record stock receipts from suppliers to increment inventory.
        </p>
      </header>
      <InwardEntryForm />
    </main>
  );
}
