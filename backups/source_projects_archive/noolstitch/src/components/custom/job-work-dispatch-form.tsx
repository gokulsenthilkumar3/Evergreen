'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Send, Trash2 } from 'lucide-react';
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
import { computeTotalQty } from '@/lib/business/production';
import { JobWorkChallanCreate } from '@/lib/contracts/production';
import { applyServerErrors } from '@/lib/forms';

type FormValues = z.input<typeof JobWorkChallanCreate>;

export function JobWorkDispatchForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(JobWorkChallanCreate),
    defaultValues: {
      challanDate: new Date().toISOString().split('T')[0],
      jobWorkerName: '',
      processType: 'KNITTING',
      notes: '',
      dispatchLines: [{ itemId: '', qtyDispatched: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dispatchLines',
  });

  useEffect(() => {
    apiFetch('/api/inventory').then((res: any) => setItems(res.items || []));
  }, []);

  const dispatchLines = form.watch('dispatchLines');
  const totalQty = computeTotalQty(dispatchLines as any);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await apiFetch('/api/production/dispatch', {
        method: 'POST',
        schema: z.any(),
        body: JSON.stringify(data),
      });

      toast.success('Challan created successfully');
      router.push('/production/history');
    } catch (err: any) {
      if (err.cause?.errors) {
        applyServerErrors(err.cause.errors, form as any);
      } else {
        toast.error('Failed to create challan');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Challan Details</CardTitle>
            <CardDescription>Dispatch raw materials to job-workers.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="challanDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobWorkerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Worker Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Balaji Knitters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="KNITTING">Knitting</option>
                      <option value="DYEING">Dyeing</option>
                      <option value="PRINTING">Printing</option>
                      <option value="STITCHING">Stitching</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Requires 5% tolerance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Raw Materials</CardTitle>
              <CardDescription>Items being dispatched.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ itemId: '', qtyDispatched: '' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-start rounded-lg border p-4 bg-muted/20"
                >
                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`dispatchLines.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Inventory Item</FormLabel>
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
                      name={`dispatchLines.${index}.qtyDispatched`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Quantity</FormLabel>
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
            <div className="flex justify-end">
              <div className="text-right">
                <span className="text-sm text-muted-foreground mr-4">Total Qty:</span>
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
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dispatching...' : 'Dispatch Materials'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
