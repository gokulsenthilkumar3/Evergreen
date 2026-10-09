'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';

type JobWorkChallan = {
  id: string;
  challanDate: string;
  jobWorkerName: string;
  processType: string;
  status: 'PENDING' | 'COMPLETED';
  notes: string | null;
  dispatchLines: any[];
  receiptLines: any[];
};

export default function ProductionHistoryPage() {
  const [challans, setChallans] = useState<JobWorkChallan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/production')
      .then((res: any) => {
        setChallans(res.items || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load production history');
        setLoading(false);
      });
  }, []);

  return (
    <main className="container-page py-section-lg">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-h1 text-foreground">Production Job-Work</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            Manage raw material dispatches and processed goods receipts.
          </p>
        </div>
        <Button asChild>
          <Link href="/production/dispatch">New Dispatch</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Challans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Job Worker
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Process
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : challans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No challans found.
                    </td>
                  </tr>
                ) : (
                  challans.map((challan) => (
                    <tr
                      key={challan.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle whitespace-nowrap">
                        {new Date(challan.challanDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 align-middle font-medium">{challan.jobWorkerName}</td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {challan.processType}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${challan.status === 'COMPLETED' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}
                        >
                          {challan.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        {challan.status === 'PENDING' ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/production/${challan.id}/receive`}>Receive Goods</Link>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
