// @polsia:user-owned — Inward Entry Form (Client Component)
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api-client';
import {
  computeInwardEntryTotals,
  computeInwardLine,
  formatCurrency,
} from '@/lib/business/inventory';
import { InwardEntryCreate, InwardEntrySchema } from '@/lib/contracts/inventory';
import { applyServerErrors } from '@/lib/forms';

type FormValues = z.input<typeof InwardEntryCreate>;
type InventoryItem = { id: string; name: string; sku: string };

const todayISO = () => new Date().toISOString().slice(0, 10);

function newLine(): FormValues['lines'][number] {
  return {
    itemId: '',
    qtyReceived: '1',
    unitCost: '0',
  };
}

function parseDecimal(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function InwardEntryForm() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    apiFetch('/api/inventory').then((res: any) => setItems(res.items || []));
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(InwardEntryCreate),
    defaultValues: {
      receiptDate: todayISO(),
      supplierName: '',
      referenceNumber: '',
      lines: [newLine()],
    },
    mode: 'onBlur',
  });

  const { control, handleSubmit, watch } = form;
  const fieldArray = useFieldArray({ control, name: 'lines' });

  const watched = watch();
  const liveLines = watched.lines.map((line) =>
    computeInwardLine({
      qtyReceived: parseDecimal(line.qtyReceived),
      unitCost: parseDecimal(line.unitCost),
    }),
  );
  const liveTotals = computeInwardEntryTotals(liveLines);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await apiFetch('/api/inward-entries', {
        method: 'POST',
        body: JSON.stringify(values),
        schema: InwardEntrySchema,
      });
      toast.success(`Inward Entry saved`);
      router.push(`/inventory`);
    } catch (err) {
      const cause = err instanceof Error ? (err.cause as unknown) : undefined;
      const applied = applyServerErrors(cause, form.setError);
      if (!applied) {
        toast.error('Could not save inward entry. Please try again.');
      }
    }
  });

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="receiptDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO / Reference No.</FormLabel>
                  <FormControl>
                    <Input placeholder="PO-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Received Items</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={fieldArray.fields.length >= 50}
              onClick={() => fieldArray.append(newLine())}
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {fieldArray.fields.map((row, index) => {
              const live = liveLines[index];
              return (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-12"
                >
                  <FormField
                    control={control}
                    name={`lines.${index}.itemId`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-5">
                        <FormLabel>Inventory Item</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select Item</option>
                            {items.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.sku})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`lines.${index}.qtyReceived`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input inputMode="decimal" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`lines.${index}.unitCost`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Unit Cost</FormLabel>
                        <FormControl>
                          <Input inputMode="decimal" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col justify-end sm:col-span-2">
                    <span className="text-caption text-muted-foreground">Line Total</span>
                    <span className="font-mono text-body text-foreground">
                      {live ? formatCurrency(live.lineTotal) : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-end sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={fieldArray.fields.length <= 1}
                      onClick={() => fieldArray.remove(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Totals & Submit */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between font-display text-h4">
              <span className="text-foreground">Total Receipt Value</span>
              <span className="text-primary">{formatCurrency(liveTotals.totalValue)}</span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" disabled={submitting} className="sm:w-auto">
                {submitting ? 'Saving…' : 'Save Receipt'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/inventory">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
