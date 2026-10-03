'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';
import { formatCurrency } from '@/lib/business/costing';

type CostingSheet = {
  id: string;
  styleCode: string;
  description: string;
  totalMaterialCost: string;
  totalProcessCost: string;
  totalOverheads: string;
  grandTotal: string;
  createdAt: string;
};

export default function CostingHistoryPage() {
  const [sheets, setSheets] = useState<CostingSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/costings')
      .then((res: any) => {
        setSheets(res.items || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load costing history');
        setLoading(false);
      });
  }, []);

  return (
    <main className="container-page py-section-lg">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-h1 text-foreground">Costing History</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            Previous garment estimates and cost analyses.
          </p>
        </div>
        <Button asChild>
          <Link href="/costing">New Costing</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Saved Costing Sheets</CardTitle>
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
                    Style Code
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Materials
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Process
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : sheets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No costing sheets found.
                    </td>
                  </tr>
                ) : (
                  sheets.map((sheet) => (
                    <tr
                      key={sheet.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle whitespace-nowrap">
                        {new Date(sheet.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 align-middle font-medium">{sheet.styleCode}</td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {sheet.description || '-'}
                      </td>
                      <td className="p-4 align-middle text-right font-mono">
                        {formatCurrency(sheet.totalMaterialCost)}
                      </td>
                      <td className="p-4 align-middle text-right font-mono">
                        {formatCurrency(sheet.totalProcessCost)}
                      </td>
                      <td className="p-4 align-middle text-right font-mono font-medium">
                        {formatCurrency(sheet.grandTotal)}
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
