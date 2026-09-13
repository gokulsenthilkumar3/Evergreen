// @polsia:user-owned — Inventory Dashboard
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  currentStock: string;
  uom: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/inventory')
      .then((res: any) => {
        setItems(res.items || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load inventory items');
        setLoading(false);
      });
  }, []);

  return (
    <main className="container-page py-section-lg">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-h1 text-foreground">Inventory</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            Current stock levels for all items.
          </p>
        </div>
        <Button asChild>
          <Link href="/inward-entry">Receive Stock</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Stock List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    SKU
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Current Stock
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    UOM
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No inventory items found. Add items to catalog first.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">{item.sku}</td>
                      <td className="p-4 align-middle">{item.name}</td>
                      <td className="p-4 align-middle text-right font-mono">
                        {Number(item.currentStock).toFixed(2)}
                      </td>
                      <td className="p-4 align-middle">{item.uom}</td>
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
