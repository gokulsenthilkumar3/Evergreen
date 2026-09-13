// @polsia:user-owned — Vyapari GST invoice form (Client Component island).
// RHF + useFieldArray: per-row validation, dynamic add/remove, live preview
// totals that match what the server persists (server re-computes from raw
// fields on submit, so client preview is best-effort for UX).
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api-client';
import {
  computeInvoiceLine,
  computeInvoiceTotals,
  formatINR,
  INDIAN_STATES_WITH_CODE,
  stateCodeFor,
} from '@/lib/business/invoice-tax';
import { InvoiceCreate, InvoiceItem } from '@/lib/contracts/invoice';
import { applyServerErrors } from '@/lib/forms';

type FormValues = z.input<typeof InvoiceCreate>;

const todayISO = () => new Date().toISOString().slice(0, 10);

function newLine(): FormValues['lines'][number] {
  return {
    description: '',
    hsnSac: '',
    qty: '1',
    unitRate: '0',
    gstRate: '5',
  };
}

function parseDecimal(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function InvoiceForm() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(InvoiceCreate),
    defaultValues: {
      sellerName: '',
      sellerGstin: '',
      sellerState: 'Tamil Nadu',
      sellerAddress: '',
      buyerName: '',
      buyerGstin: '',
      buyerState: 'Karnataka',
      buyerAddress: '',
      invoiceNumber: `INV-${todayISO().replace(/-/g, '')}`,
      invoiceDate: todayISO(),
      lines: [newLine()],
    },
    mode: 'onBlur',
  });

  const { control, handleSubmit, watch } = form;
  const fieldArray = useFieldArray({ control, name: 'lines' });

  // Live preview: re-derive per-line totals + invoice totals from raw form
  // fields. The server recomputes on submit so this is intentionally an
  // approximation (a trader can't see server-only state in the live preview);
  // when they hit Save, what the server stores matches this preview.
  const watched = watch();
  const liveLines = watched.lines.map((line) =>
    computeInvoiceLine({
      qty: parseDecimal(line.qty),
      unitRate: parseDecimal(line.unitRate),
      gstRate: parseDecimal(line.gstRate),
      sellerState: watched.sellerState,
      buyerState: watched.buyerState,
    }),
  );
  const liveTotals = computeInvoiceTotals(liveLines);
  const split: 'CGST_SGST' | 'IGST' =
    watched.sellerState === watched.buyerState ? 'CGST_SGST' : 'IGST';

  const onSubmit = handleSubmit(async (values) => {
    try {
      const created = await apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(values),
        schema: InvoiceItem,
      });
      toast.success(`Invoice ${created.invoiceNumber} saved`);
      router.push(`/vyapari/invoice/${created.id}`);
    } catch (err) {
      const cause = err instanceof Error ? (err.cause as unknown) : undefined;
      const applied = applyServerErrors(cause, form.setError);
      if (!applied) {
        toast.error('Could not save invoice. Please try again.');
      }
    }
  });

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        {/* ── Seller + Buyer side by side ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-eyebrow">Bill from</p>
              <CardTitle>Seller (you)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={control}
                name="sellerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tiruppur Knits Pvt Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="sellerGstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="33ABCDE1234F1Z5"
                        maxLength={15}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="sellerState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State (place of supply)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES_WITH_CODE.map((s) => (
                          <SelectItem key={s.code} value={s.name}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="sellerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Shop 4, Kumaran Road, Tiruppur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-eyebrow">Bill to</p>
              <CardTitle>Buyer</CardTitle>
              <CardDescription>
                If the buyer&apos;s state matches yours, GST splits evenly into CGST + SGST.
                Otherwise the full rate is collected as IGST.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bengaluru Garments" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="buyerGstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="29ABCDE1234F1Z5"
                        maxLength={15}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="buyerState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES_WITH_CODE.map((s) => (
                          <SelectItem key={s.code} value={s.name}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="buyerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="22, MG Road, Bengaluru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Invoice meta ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <p className="text-eyebrow">Invoice meta</p>
            <CardTitle>Reference &amp; date</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice number</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-2025-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Line items ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-eyebrow">Goods &amp; services</p>
              <CardTitle>Line items</CardTitle>
              <CardDescription>Default GST rate is 5%. Edit per line.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={fieldArray.fields.length >= 50}
              onClick={() => fieldArray.append(newLine())}
            >
              <Plus className="h-4 w-4" /> Add line
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
                    name={`lines.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Cotton jersey fabric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`lines.${index}.hsnSac`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>HSN/SAC</FormLabel>
                        <FormControl>
                          <Input placeholder="5208" maxLength={8} inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`lines.${index}.qty`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
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
                    name={`lines.${index}.unitRate`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Unit rate (₹)</FormLabel>
                        <FormControl>
                          <Input inputMode="decimal" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`lines.${index}.gstRate`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>GST %</FormLabel>
                        <FormControl>
                          <Input inputMode="decimal" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col justify-end sm:col-span-2">
                    <span className="text-caption text-muted-foreground">Line total</span>
                    <span className="font-mono text-body text-foreground">
                      {live ? formatINR(live.lineTotal) : formatINR(0)}
                    </span>
                  </div>
                  <div className="flex justify-end sm:col-span-12">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={fieldArray.fields.length <= 1}
                      onClick={() => fieldArray.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Totals preview + submit ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <p className="text-eyebrow">Live totals</p>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              {split === 'CGST_SGST' ? 'Intra-state' : 'Inter-state'} ({watched.sellerState} →{' '}
              {watched.buyerState})
            </CardTitle>
            <CardDescription>
              {split === 'CGST_SGST'
                ? 'Tax splits evenly between CGST and SGST.'
                : 'Full tax rate collected as IGST.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-body">
              <span className="text-muted-foreground">Taxable value</span>
              <span className="font-mono">{formatINR(liveTotals.totalTaxable)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-body">
              <span className="text-muted-foreground">CGST</span>
              <span className="font-mono">{formatINR(liveTotals.totalCgst)}</span>
            </div>
            <div className="flex items-center justify-between text-body">
              <span className="text-muted-foreground">SGST</span>
              <span className="font-mono">{formatINR(liveTotals.totalSgst)}</span>
            </div>
            <div className="flex items-center justify-between text-body">
              <span className="text-muted-foreground">IGST</span>
              <span className="font-mono">{formatINR(liveTotals.totalIgst)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-display text-h4">
              <span className="text-foreground">Grand total</span>
              <span className="text-primary">{formatINR(liveTotals.grandTotal)}</span>
            </div>
            <p className="text-caption text-muted-foreground">
              State code preview: seller {stateCodeFor(watched.sellerState)} · buyer{' '}
              {stateCodeFor(watched.buyerState)}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" disabled={submitting} className="sm:w-auto">
                {submitting ? 'Saving…' : 'Save & preview'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/vyapari/invoice/sample">Preview a sample invoice</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
