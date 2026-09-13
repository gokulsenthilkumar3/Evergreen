'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import {
  computeCostingComponent,
  computeCostingTotals,
  formatCurrency,
} from '@/lib/business/costing';
import { CostingSheetCreate } from '@/lib/contracts/costing';
import { applyServerErrors } from '@/lib/forms';

type FormValues = z.input<typeof CostingSheetCreate>;

export function CostingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(CostingSheetCreate),
    defaultValues: {
      styleCode: '',
      description: '',
      components: [{ type: 'MATERIAL', description: '', qty: '1', rate: '0', amount: '0' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'components',
  });

  // Watch for live totals
  const components = form.watch('components');
  const totals = computeCostingTotals(components as any);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await apiFetch('/api/costings', {
        method: 'POST',
        schema: z.any(), // bypass strict schema check for now
        body: JSON.stringify(data),
      });

      toast.success('Costing sheet saved successfully');
      router.push('/costing/history');
    } catch (err: any) {
      if (err.cause?.errors) {
        applyServerErrors(err.cause.errors, form as any);
      } else {
        toast.error('Failed to save costing sheet');
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
            <CardTitle>Garment Details</CardTitle>
            <CardDescription>Enter the style code and description.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="styleCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. TSHIRT-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Men's Cotton Polo" {...field} />
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
              <CardTitle>Costing Components</CardTitle>
              <CardDescription>Add materials, processing, and overhead costs.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ type: 'MATERIAL', description: '', qty: '1', rate: '0', amount: '0' })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => {
                const qty = form.watch(`components.${index}.qty`);
                const rate = form.watch(`components.${index}.rate`);
                const amount = computeCostingComponent(qty, rate);

                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-4 sm:flex-row sm:items-start rounded-lg border p-4 bg-muted/20"
                  >
                    <div className="grid flex-1 gap-4 sm:grid-cols-5">
                      <FormField
                        control={form.control}
                        name={`components.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-1">
                            <FormLabel className="text-xs">Type</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="MATERIAL">Material</option>
                                <option value="PROCESS">Process</option>
                                <option value="OVERHEAD">Overhead</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`components.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-xs">Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Cotton Yarn 40s" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`components.${index}.qty`}
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

                      <FormField
                        control={form.control}
                        name={`components.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Rate (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-4 sm:pt-6">
                      <div className="w-24 text-right font-mono text-sm font-medium">
                        {formatCurrency(amount)}
                      </div>
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
                );
              })}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-4 rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Materials</span>
                  <span className="font-mono">{formatCurrency(totals.totalMaterialCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Processing</span>
                  <span className="font-mono">{formatCurrency(totals.totalProcessCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Overheads</span>
                  <span className="font-mono">{formatCurrency(totals.totalOverheads)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Grand Total</span>
                  <span className="font-mono text-lg">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/costing/history">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Receipt className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Costing Sheet'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
