'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { computeTotalQty, computeTotalScrap } from '@/lib/business/production';
import { JobWorkReceiveCreate } from '@/lib/contracts/production';
import { applyServerErrors } from '@/lib/forms';

type FormValues = z.input<typeof JobWorkReceiveCreate>;

export function JobWorkReceiptForm({ challanId }: { challanId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(JobWorkReceiveCreate),
    defaultValues: {
      receiptLines: [{ itemId: '', qtyReceived: '', scrapQty: '0' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'receiptLines',
  });

  useEffect(() => {
    apiFetch('/api/inventory').then((res: any) => setItems(res.items || []));
  }, []);

  const receiptLines = form.watch('receiptLines');
  const totalQty = computeTotalQty(receiptLines as any);
  const totalScrap = computeTotalScrap(receiptLines as any);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/production/${challanId}/receive`, {
        method: 'POST',
        schema: z.any(),
        body: JSON.stringify(data),
      });

      toast.success('Receipt logged successfully');
      router.push('/production/history');
    } catch (err: any) {
      if (err.cause?.errors) {
        applyServerErrors(err.cause.errors, form as any);
      } else {
        toast.error('Failed to log receipt');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Receive Processed Goods</CardTitle>
              <CardDescription>
                Log the processed goods received from the job worker.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ itemId: '', qtyReceived: '', scrapQty: '0' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Receipt Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-start rounded-lg border p-4 bg-muted/20"
                >
                  <div className="grid flex-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`receiptLines.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Processed Item (e.g. Fabric)</FormLabel>
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
                      control={form.control}
                      name={`receiptLines.${index}.qtyReceived`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Qty Received</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`receiptLines.${index}.scrapQty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Scrap / Loss Qty</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-4 sm:pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />
            <div className="flex justify-end gap-8">
              <div className="text-right">
                <span className="text-sm text-muted-foreground mr-4">Total Scrap:</span>
                <span className="font-mono text-lg">{totalScrap}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground mr-4">Total Received:</span>
                <span className="font-mono text-lg">{totalQty}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/production/history">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Mark Challan as Completed'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
