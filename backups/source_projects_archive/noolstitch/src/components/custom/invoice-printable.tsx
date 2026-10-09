// @polsia:user-owned — Vyapari GST invoice printable view. Rendered by both
// /vyapari/invoice/[id] (real persisted invoice from Postgres) and
// /vyapari/invoice/sample (static literal sample). The PrintButton is a tiny
// 'use client' island defined inline here so the bulk of the layout can stay
// in a Server Component for SEO.
'use client';

import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatINR, stateCodeFor } from '@/lib/business/invoice-tax';
import type { InvoiceItem } from '@/lib/contracts/invoice';

function PrintButton() {
  return (
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button asChild variant="outline" size="sm">
        <a href="/vyapari/invoice">← New invoice</a>
      </Button>
      <Button type="button" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print / Save as PDF
      </Button>
    </div>
  );
}

export interface InvoicePrintableProps {
  invoice: InvoiceItem;
  /** When `true`, the page renders as a server-rendered sample (no print button
   *  hiding on paper — it stays hidden via .no-print either way). */
  isSample?: boolean;
}

export function InvoicePrintable({ invoice, isSample = false }: InvoicePrintableProps) {
  const split = invoice.sellerState === invoice.buyerState ? 'CGST_SGST' : 'IGST';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 print:px-0 print:py-0 sm:px-6">
      {!isSample ? <PrintButton /> : null}

      <div className="print-area rounded-xl border border-border bg-card text-card-foreground shadow-sm print:rounded-none print:border-0 print:shadow-none">
        {/* ── Title row ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between print:border-b-2">
          <div>
            <p className="text-eyebrow text-muted-foreground">Tax Invoice</p>
            <h1 className="font-display text-display leading-none tracking-tight text-foreground">
              {invoice.invoiceNumber}
            </h1>
            <p className="mt-2 text-caption text-muted-foreground">
              Issued on {invoice.invoiceDate.split('-').reverse().join('/')}
            </p>
          </div>
          <Badge variant="secondary" className="self-start text-caption">
            {split === 'CGST_SGST' ? 'Intra-state · CGST + SGST' : 'Inter-state · IGST'}
          </Badge>
        </div>

        {/* ── Seller + Buyer ─────────────────────────────────────────── */}
        <section className="grid gap-6 border-b border-border p-6 sm:grid-cols-2 print:border-b-2">
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
              Bill from
            </p>
            <p className="mt-2 font-display text-h4 text-foreground">{invoice.sellerName}</p>
            <p className="mt-1 text-body text-muted-foreground">{invoice.sellerAddress}</p>
            <p className="mt-1 text-caption text-muted-foreground">
              GSTIN: <span className="font-mono">{invoice.sellerGstin}</span>
            </p>
            <p className="text-caption text-muted-foreground">
              State: {invoice.sellerState} ({stateCodeFor(invoice.sellerState)})
            </p>
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
              Bill to
            </p>
            <p className="mt-2 font-display text-h4 text-foreground">{invoice.buyerName}</p>
            <p className="mt-1 text-body text-muted-foreground">{invoice.buyerAddress}</p>
            <p className="mt-1 text-caption text-muted-foreground">
              GSTIN: <span className="font-mono">{invoice.buyerGstin}</span>
            </p>
            <p className="text-caption text-muted-foreground">
              State: {invoice.buyerState} ({stateCodeFor(invoice.buyerState)})
            </p>
          </div>
        </section>

        {/* ── Line items ─────────────────────────────────────────────── */}
        <section className="p-6">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">HSN</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">GST%</TableHead>
                <TableHead className="text-right">Taxable</TableHead>
                <TableHead className="text-right">
                  {split === 'CGST_SGST' ? 'CGST · SGST' : 'IGST'}
                </TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, idx) => {
                const half = Number(item.cgst) + Number(item.sgst);
                const _taxCol = split === 'CGST_SGST' ? `${item.cgst} · ${item.sgst}` : item.igst;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{item.description}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.hsnSac}</TableCell>
                    <TableCell className="text-right font-mono">{item.qty}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(Number(item.unitRate))}
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.gstRate}%</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(Number(item.taxable))}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatINR(half)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatINR(Number(item.lineTotal))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        <Separator />

        {/* ── Totals ─────────────────────────────────────────────────── */}
        <section className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="hidden print:block" />
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex w-full max-w-xs items-center justify-between text-body sm:w-72">
              <span className="text-muted-foreground">Taxable total</span>
              <span className="font-mono">{formatINR(Number(invoice.totalTaxable))}</span>
            </div>
            {split === 'CGST_SGST' ? (
              <>
                <div className="flex w-full max-w-xs items-center justify-between text-body sm:w-72">
                  <span className="text-muted-foreground">CGST</span>
                  <span className="font-mono">{formatINR(Number(invoice.totalCgst))}</span>
                </div>
                <div className="flex w-full max-w-xs items-center justify-between text-body sm:w-72">
                  <span className="text-muted-foreground">SGST</span>
                  <span className="font-mono">{formatINR(Number(invoice.totalSgst))}</span>
                </div>
              </>
            ) : (
              <div className="flex w-full max-w-xs items-center justify-between text-body sm:w-72">
                <span className="text-muted-foreground">IGST</span>
                <span className="font-mono">{formatINR(Number(invoice.totalIgst))}</span>
              </div>
            )}
            <Separator className="my-2 w-full max-w-xs sm:w-72" />
            <div className="flex w-full max-w-xs items-center justify-between font-display text-h4 sm:w-72">
              <span className="text-foreground">Grand total</span>
              <span className="text-primary">{formatINR(Number(invoice.grandTotal))}</span>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="border-t border-border p-6 print:border-t-2">
          <p className="text-caption text-muted-foreground">
            Invoice generated by Noolstitch Vyapari · Saved on {invoice.createdAt.slice(0, 10)}.
          </p>
        </div>
      </div>
    </div>
  );
}
