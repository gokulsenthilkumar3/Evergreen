import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { Prisma, WorkflowDocument } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';
import { assertOpenPeriod, assertOverheadAvailable, freezeOrdersForHold, journal, money } from '../../services/business-ledger';
import { stockEventDate } from '../../utils/stock-event-date';

type Tx = Prisma.TransactionClient;
const positive = (value: unknown, label = 'Quantity') => {
  const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new BadRequestException(`${label} must be positive`); return n;
};
const nonnegative = (value: unknown, label = 'Amount') => {
  const n = Number(value ?? 0); if (!Number.isFinite(n) || n < 0) throw new BadRequestException(`${label} must be non-negative`); return n;
};
const cash = (value: unknown) => { const n = positive(value, 'Amount'); if (Math.abs(n - money(n)) > 0.000001) throw new BadRequestException('Amounts use two decimal places'); return n; };

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}
  document(id: number) { return this.prisma.workflowDocument.findUniqueOrThrow({ where: { id }, include: { lines: { include: { item: true } }, supplier: true, children: true } }); }
  async overview() {
    const [documents, suppliers, lots, wip, journals, periods, customers, invoices, orders, items, locations, valuation, costs, inwardBatches] = await Promise.all([
      this.prisma.workflowDocument.findMany({ include: { lines: { include: { item: true } }, supplier: true }, orderBy: { id: 'desc' } }),
      this.prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.stockLot.findMany({ include: { item: true, holds: true, movements: true }, orderBy: { id: 'asc' } }),
      this.prisma.wipLot.findMany({ orderBy: { id: 'desc' } }),
      this.prisma.journalEntry.findMany({ include: { lines: true }, orderBy: { id: 'desc' } }),
      this.prisma.accountingPeriod.findMany({ orderBy: { through: 'desc' } }),
      this.prisma.customer.findMany({ where: { active: true } }),
      this.prisma.invoice.findMany({ where: { customerId: { not: null }, status: { not: 'VOID' } }, include: { items: { include: { item: true } } } }),
      this.prisma.salesOrder.findMany({ include: { lines: { include: { item: true } }, customer: true } }),
      this.prisma.catalogueItem.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      this.prisma.warehouseLocation.findMany({ where: { active: true } }),
      this.prisma.stockValuation.findMany({ include: { movement: { include: { item: true } } } }),
      this.prisma.costingEntry.findMany({ orderBy: { date: 'desc' } }),
      this.prisma.inwardBatch.findMany({ orderBy: { date: 'desc' } }),
    ]);
    const accounts = new Map<string, { account: string; debit: number; credit: number }>();
    for (const entry of journals) for (const line of entry.lines) {
      const account = accounts.get(line.account) || { account: line.account, debit: 0, credit: 0 };
      account.debit = money(account.debit + line.debit); account.credit = money(account.credit + line.credit); accounts.set(line.account, account);
    }
    return { documents, suppliers, costs, inwardBatches, lots: lots.map(({ movements, ...lot }) => ({ ...lot, quantity: movements.reduce((s, m) => s + m.quantity, 0), held: lot.holds.filter(h => h.status === 'HELD').reduce((s, h) => s + h.quantity, 0) })), wip, journals, periods, customers, invoices, orders, items, locations,
      trialBalance: [...accounts.values()].map(a => ({ ...a, balance: money(a.debit - a.credit) })),
      valuation: { missing: valuation.filter(v => v.status === 'UNVALUED'), value: money(valuation.reduce((s, v) => s + (v.value || 0), 0)), complete: valuation.every(v => v.status !== 'UNVALUED') } };
  }

  supplier(body: any) {
    if (!body || typeof body.name !== 'string' || !body.name.trim()) throw new BadRequestException('Supplier name is required');
    for (const key of ['code', 'gstin', 'address']) if (body[key] !== undefined && body[key] !== null && typeof body[key] !== 'string') throw new BadRequestException(`${key} must be text`);
    return this.prisma.supplier.create({ data: { name: body.name.trim(), code: body.code?.trim() || `SUP-${randomUUID().slice(0, 8)}`, gstin: body.gstin || null, address: body.address || null } });
  }

  async post(kind: string, body: any, actor: string) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BadRequestException('Enter a business operation with its source details');
    if (body.date !== undefined && body.date !== '' && typeof body.date !== 'string') throw new BadRequestException('Posting time must be a date/time string');
    for (const key of ['notes', 'documentNo', 'reference', 'lotCode', 'grade', 'colour', 'process']) if (body[key] !== undefined && body[key] !== null && typeof body[key] !== 'string') throw new BadRequestException(`${key} must be text`);
    for (const key of ['customerId', 'supplierId', 'invoiceId', 'orderId', 'originId', 'billId', 'lotId', 'wipId', 'itemId', 'outputItemId', 'costingEntryId', 'inwardId', 'movementId']) {
      if (body[key] === '' || body[key] === null) body[key] = undefined;
      if (body[key] !== undefined && (!Number.isSafeInteger(Number(body[key])) || Number(body[key]) < 1)) throw new BadRequestException(`Choose a valid ${key.replace('Id', '')}`);
    }
    const allowed = ['SALES_RETURN', 'CUSTOMER_RECEIPT', 'CUSTOMER_ALLOCATION', 'CUSTOMER_REFUND', 'CUSTOMER_UNALLOCATE', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'SUPPLIER_BILL', 'PURCHASE_RETURN', 'SUPPLIER_PAYMENT', 'SUPPLIER_ALLOCATION', 'SUPPLIER_CREDIT_ALLOCATION', 'SUPPLIER_REFUND', 'PURCHASE_ORDER_CANCEL', 'QUALITY_HOLD', 'LOT_RECLASSIFY', 'WIP_COMPLETION', 'TRANSFORM_DISPATCH', 'TRANSFORM_RECEIPT', 'TRANSFORM_CANCEL', 'ORDER_DISPATCH', 'DISPATCH_RETURN', 'PICK', 'VALUATION'];
    allowed.push('COST_CORRECTION');
    allowed.push('LINK_COTTON_RECEIPT');
    allowed.push('RESUME_ORDER');
    if (!allowed.includes(kind)) throw new BadRequestException('Unknown business operation');
    if (typeof body.requestKey !== 'string' || !body.requestKey.trim() || body.requestKey.length > 128) throw new BadRequestException('A request key is required for retry-safe posting');
    const { requestKey, ...payload } = body;
    const hash = createHash('sha256').update(JSON.stringify({ kind, payload })).digest('hex');
    return this.prisma.stockTransaction(async tx => {
      const previous = await tx.workflowDocument.findUnique({ where: { requestKey: String(requestKey) }, include: { lines: true } });
      if (previous) { if (previous.requestHash !== hash || previous.kind !== kind) throw new BadRequestException('This request key was used for different details'); return previous; }
      const date = stockEventDate(body.date); await assertOpenPeriod(tx, date);
      if (body.originId && !await tx.workflowDocument.findUnique({ where: { id: Number(body.originId) } })) throw new BadRequestException('Choose an existing source document');
      if (body.customerId && !(await tx.customer.findUnique({ where: { id: Number(body.customerId) } }))?.active) throw new BadRequestException('Choose an active customer');
      if (body.supplierId && !(await tx.supplier.findUnique({ where: { id: Number(body.supplierId) } }))?.active) throw new BadRequestException('Choose an active supplier');
      const doc = await tx.workflowDocument.create({ data: { kind, documentNo: body.documentNo?.trim() || `${kind}-${randomUUID().slice(0, 8).toUpperCase()}`, requestKey: String(requestKey), requestHash: hash, date, createdBy: actor, notes: body.notes || null, customerId: body.customerId ? Number(body.customerId) : null, supplierId: body.supplierId ? Number(body.supplierId) : null, invoiceId: body.invoiceId ? Number(body.invoiceId) : null, orderId: body.orderId ? Number(body.orderId) : null, originId: body.originId ? Number(body.originId) : null, metadata: '{}' } });
      switch (kind) {
        case 'SALES_RETURN': await this.salesReturn(tx, doc, body); break;
        case 'CUSTOMER_RECEIPT': case 'CUSTOMER_ALLOCATION': case 'CUSTOMER_REFUND': case 'CUSTOMER_UNALLOCATE': await this.customerFunds(tx, doc, body); break;
        case 'PURCHASE_ORDER': case 'GOODS_RECEIPT': case 'SUPPLIER_BILL': case 'PURCHASE_RETURN': await this.procurement(tx, doc, body); break;
        case 'SUPPLIER_PAYMENT': case 'SUPPLIER_ALLOCATION': case 'SUPPLIER_CREDIT_ALLOCATION': case 'SUPPLIER_REFUND': await this.supplierFunds(tx, doc, body); break;
        case 'PURCHASE_ORDER_CANCEL': { const source = await this.origin(tx, doc, 'PURCHASE_ORDER'); await tx.workflowDocument.update({ where: { id: source.id }, data: { status: 'CANCELLED' } }); break; }
        case 'QUALITY_HOLD': await this.hold(tx, doc, body); break;
        case 'LOT_RECLASSIFY': await this.reclassify(tx, doc, body); break;
        case 'WIP_COMPLETION': await this.completeWip(tx, doc, body); break;
        case 'TRANSFORM_DISPATCH': case 'TRANSFORM_RECEIPT': case 'TRANSFORM_CANCEL': await this.transform(tx, doc, body); break;
        case 'ORDER_DISPATCH': case 'DISPATCH_RETURN': await this.orderDispatch(tx, doc, body); break;
        case 'PICK': await this.pick(tx, doc, body); break;
        case 'VALUATION': await this.valueOpening(tx, doc, body); break;
        case 'LINK_COTTON_RECEIPT': await this.linkCottonReceipt(tx, doc, body); break;
        case 'RESUME_ORDER': {
          const order = await tx.salesOrder.findUniqueOrThrow({ where: { id: Number(body.orderId) }, include: { lines: { include: { item: true } } } });
          if (order.status !== 'ON_HOLD') throw new BadRequestException('Choose an order held for quality review');
          for (const line of order.lines) {
            const remaining = Math.max(0, line.quantity - Math.max(line.invoicedQty, line.dispatchedQty));
            if (remaining && line.item.type !== 'SERVICE') await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: 0, reservedQty: remaining, date: doc.date, movementType: 'SALES_RESERVE', referenceType: 'SALES_ORDER', referenceId: String(order.id), createdBy: actor } });
          }
          await tx.salesOrder.update({ where: { id: order.id }, data: { status: order.lines.some(l => l.invoicedQty > 0) ? 'PARTIALLY_INVOICED' : 'CONFIRMED' } }); break;
        }
        case 'COST_CORRECTION': {
          const cost = await tx.costingEntry.findUniqueOrThrow({ where: { id: Number(body.costingEntryId) } });
          const amount = Number(body.amount);
          if (!Number.isFinite(amount) || !amount || money(amount) !== amount || !body.notes?.trim()) throw new BadRequestException('Enter a signed correction amount and evidence');
          const previous = await tx.workflowDocument.findMany({ where: { kind: 'COST_CORRECTION', id: { not: doc.id } } });
          const corrected = previous.filter(d => JSON.parse(d.metadata).costingEntryId === cost.id).reduce((s, d) => s + d.total, 0);
          if (cost.totalCost + corrected + amount < -0.000001) throw new BadRequestException('Correction exceeds the original net expense');
          await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, actor, [{ account: 'MANUFACTURING_OVERHEAD', debit: amount > 0 ? amount : 0, credit: amount < 0 ? -amount : 0 }, { account: 'ACCRUED_EXPENSES', credit: amount > 0 ? amount : 0, debit: amount < 0 ? -amount : 0 }]);
          await tx.workflowDocument.update({ where: { id: doc.id }, data: { total: amount, metadata: JSON.stringify({ costingEntryId: cost.id }) } }); break;
        }
      }
      await tx.activityLog.create({ data: { action: 'POST', module: 'WORKFLOWS', username: actor, details: `${kind} · ${doc.documentNo}` } });
      return tx.workflowDocument.findUniqueOrThrow({ where: { id: doc.id }, include: { lines: { include: { item: true } } } });
    });
  }

  private async line(tx: Tx, doc: WorkflowDocument, input: any, extra: any = {}) {
    if (!Number.isSafeInteger(Number(input.itemId)) || Number(input.itemId) < 1) throw new BadRequestException('Choose an item for each document line');
    const item = await tx.catalogueItem.findUnique({ where: { id: Number(input.itemId) } });
    if (!item?.active) throw new BadRequestException('Choose an active catalogue item');
    const quantity = positive(input.quantity), rate = nonnegative(input.rate), gstRate = nonnegative(input.gstRate);
    if (gstRate > 100) throw new BadRequestException('Tax rate must be between 0 and 100');
    const discount = nonnegative(input.discount);
    if (discount > quantity * rate) throw new BadRequestException('Discount exceeds line value');
    const net = money(quantity * rate - discount), tax = money(net * gstRate / 100);
    if (!Number.isFinite(net + tax) || net + tax > 1e12) throw new BadRequestException('Line value is outside the supported amount range');
    return tx.workflowLine.create({ data: { documentId: doc.id, itemId: item.id, quantity, rate, gstRate, discount, net, tax, lotId: input.lotId ? Number(input.lotId) : null, sourceLineId: input.sourceLineId ? Number(input.sourceLineId) : null, ...extra } });
  }
  private inputs(body: any) {
    if (!Array.isArray(body.lines) || !body.lines.length) throw new BadRequestException('At least one line is required');
    if (body.lines.some((l: any) => !l || typeof l !== 'object' || Array.isArray(l))) throw new BadRequestException('Enter valid document lines');
    const keys = body.lines.map((l: any) => l.sourceLineId ? `source:${Number(l.sourceLineId)}` : l.invoiceItemId ? `invoice:${Number(l.invoiceItemId)}` : `${Number(l.itemId)}:${Number(l.lotId) || ''}`);
    if (new Set(keys).size !== keys.length) throw new BadRequestException('Combine duplicate source lines');
    return body.lines;
  }
  private async total(tx: Tx, doc: WorkflowDocument) {
    const lines = await tx.workflowLine.findMany({ where: { documentId: doc.id } });
    const subtotal = money(lines.reduce((s, l) => s + l.net, 0)), tax = money(lines.reduce((s, l) => s + l.tax, 0));
    return tx.workflowDocument.update({ where: { id: doc.id }, data: { subtotal, tax, total: money(subtotal + tax) } });
  }
  private async move(tx: Tx, doc: WorkflowDocument, itemId: number, quantity: number, lotId?: number | null, unitCost?: number | null) {
    const item = await tx.catalogueItem.findUniqueOrThrow({ where: { id: itemId } });
    if (item.type === 'SERVICE') return;
    if (item.legacySource && item.type === 'RAW_MATERIAL') throw new BadRequestException('Cotton batch quantities are posted through Inward and Production');
    if (lotId) { const lot = await tx.stockLot.findUnique({ where: { id: lotId } }); if (!lot || lot.itemId !== itemId || lot.owner !== 'COMPANY') throw new BadRequestException('Choose the company-owned lot belonging to this item'); }
    return tx.stockMovement.create({ data: { itemId, quantity, date: doc.date, lotId: lotId || null, unitCost: unitCost ?? null, movementType: doc.kind, referenceType: doc.kind, referenceId: String(doc.id), createdBy: doc.createdBy } });
  }
  private async origin(tx: Tx, doc: WorkflowDocument, kind: string) {
    const source = doc.originId ? await tx.workflowDocument.findUnique({ where: { id: doc.originId }, include: { lines: { include: { item: true } }, children: { include: { lines: true } } } }) : null;
    if (!source || (source.kind !== kind && !(kind === 'GOODS_RECEIPT' && source.kind === 'LINK_COTTON_RECEIPT')) || ['CANCELLED', 'REVERSED'].includes(source.status)) throw new BadRequestException(`Choose an active ${kind.toLowerCase().replaceAll('_', ' ')}`);
    if (doc.date < source.date) throw new BadRequestException('A follow-up cannot precede its source posting');
    return source;
  }

  private async salesReturn(tx: Tx, doc: WorkflowDocument, body: any) {
    const invoice = await tx.invoice.findUnique({ where: { id: Number(body.invoiceId) }, include: { items: { include: { item: true } } } });
    if (!invoice?.customerId || invoice.status === 'VOID') throw new BadRequestException('Choose an active invoice');
    if (doc.date < invoice.date) throw new BadRequestException('A return cannot precede its invoice');
    let cgst = 0, sgst = 0, igst = 0;
    for (const input of this.inputs(body)) {
      const original = invoice.items.find(l => l.id === Number(input.invoiceItemId));
      if (!original?.itemId) throw new BadRequestException('Return lines must belong to the original invoice');
      const qty = positive(input.quantity), originalQty = Number(original.quantity || original.weight);
      const prior = await tx.workflowLine.aggregate({ where: { invoiceItemId: original.id, document: { kind: 'SALES_RETURN' } }, _sum: { quantity: true, net: true, tax: true } });
      if (qty > originalQty - (prior._sum.quantity || 0) + 0.000001) throw new BadRequestException('Returned quantity exceeds the original unreturned quantity');
      const final = Math.abs(originalQty - (prior._sum.quantity || 0) - qty) < 0.000001;
      const lineBase = money(originalQty * original.rate - original.discount);
      const fullNet = money(lineBase - (invoice.subtotal ? invoice.discount * lineBase / invoice.subtotal : 0));
      const fullTax = money(fullNet * original.gstRate / 100);
      const netRemaining = Math.max(0, money(fullNet - (prior._sum.net || 0))), taxRemaining = Math.max(0, money(fullTax - (prior._sum.tax || 0)));
      const net = final ? netRemaining : Math.min(netRemaining, money(fullNet * qty / originalQty));
      const tax = final ? taxRemaining : Math.min(taxRemaining, money(fullTax * qty / originalQty));
      const rejected = nonnegative(input.rejectedQty, 'Quarantined quantity'); if (rejected > qty) throw new BadRequestException('Quarantined quantity exceeds the return');
      const line = await this.line(tx, doc, { ...input, itemId: original.itemId, rate: original.rate, gstRate: original.gstRate, discount: 0 }, { invoiceItemId: original.id, net, tax, rejectedQty: rejected });
      if (original.item?.type !== 'SERVICE') {
        if (body.returnConfirmed !== true) throw new BadRequestException('Confirm the goods were physically received');
        const lot = await tx.stockLot.create({ data: { code: `RETURN-${doc.id}-${line.id}`, itemId: original.itemId, origin: invoice.invoiceNo } });
        const outwardRows = invoice.outwardId ? await tx.yarnInventory.findMany({ where: { type: 'OUTWARD', reference: `O-${invoice.outwardId}` } }) : [];
        const issues = await tx.stockMovement.findMany({ where: { itemId: original.itemId, ...(invoice.outwardId ? { referenceType: 'LEGACY_YARN', referenceId: { in: outwardRows.map(r => String(r.id)) } } : { referenceId: String(invoice.fulfilmentId || invoice.id), referenceType: invoice.fulfilmentId ? 'ORDER_DISPATCH' : 'INVOICE' }), quantity: { lt: 0 } }, include: { valuation: true } });
        const issueQty = issues.reduce((s, m) => s - m.quantity, 0), issueValue = issues.reduce((s, m) => s - (m.valuation?.value || 0), 0);
        const cost = issues.length && issues.every(m => m.valuation?.status === 'VALUED') && issueQty ? issueValue / issueQty : null;
        await this.move(tx, doc, original.itemId, qty, lot.id, cost);
        await tx.workflowLine.update({ where: { id: line.id }, data: { lotId: lot.id } });
        if (rejected) await tx.stockHold.create({ data: { lotId: lot.id, quantity: rejected, reason: body.notes || 'Returned material awaiting inspection', createdBy: doc.createdBy, createdAt: doc.date } });
      }
      if (invoice.igst) igst += tax; else { cgst += money(tax / 2); sgst += money(tax - money(tax / 2)); }
    }
    let totals = await this.total(tx, doc);
    // Preserve the original document's final paise, including tax splitting round-off.
    const allQty = await tx.workflowLine.groupBy({ by: ['invoiceItemId'], where: { document: { invoiceId: invoice.id, kind: 'SALES_RETURN' } }, _sum: { quantity: true } });
    if (invoice.items.every(l => allQty.some(q => q.invoiceItemId === l.id && Math.abs((q._sum.quantity || 0) - Number(l.quantity || l.weight)) < 0.000001))) {
      const remaining = money(invoice.total - invoice.creditTotal);
      const delta = money(remaining - totals.total); totals = await tx.workflowDocument.update({ where: { id: doc.id }, data: { total: remaining, subtotal: money(totals.subtotal + delta) } });
    }
    if (totals.total > invoice.total - invoice.creditTotal + 0.000001) throw new BadRequestException('Credit exceeds the original invoice value');
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { customerId: invoice.customerId, metadata: JSON.stringify({ invoiceNo: invoice.invoiceNo, sellerName: invoice.sellerName, sellerAddress: invoice.sellerAddress, sellerGSTIN: invoice.sellerGSTIN, customerName: invoice.customerName, customerAddress: invoice.customerAddress, customerGSTIN: invoice.customerGSTIN, cgst: money(cgst), sgst: money(sgst), igst: money(igst), reason: body.notes }) } });
    const creditTotal = money(invoice.creditTotal + totals.total), netDue = money(invoice.total - creditTotal);
    await tx.invoice.update({ where: { id: invoice.id }, data: { creditTotal, status: invoice.amountPaid >= netDue - 0.000001 ? 'PAID' : invoice.amountPaid > 0 ? 'PARTIAL' : 'UNPAID' } });
    await tx.customerLedgerEntry.create({ data: { customerId: invoice.customerId, date: doc.date, type: 'SALES_RETURN', credit: totals.total, reference: doc.documentNo, notes: `Against ${invoice.invoiceNo}` } });
    await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [
      { account: 'SALES_RETURNS', debit: totals.subtotal }, { account: 'OUTPUT_CGST', debit: money(cgst) }, { account: 'OUTPUT_SGST', debit: money(sgst) }, { account: 'OUTPUT_IGST', debit: money(igst) }, { account: 'RECEIVABLE', party: `CUSTOMER:${invoice.customerId}`, credit: totals.total },
    ]);
  }

  private async setPaid(tx: Tx, invoiceId: number, delta: number, doc: WorkflowDocument, allowCreditBalance = false) {
    const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    const paid = money(invoice.amountPaid + delta), due = money(invoice.total - invoice.creditTotal);
    if (paid < -0.000001 || (delta > 0 && !allowCreditBalance && paid > due + 0.000001)) throw new BadRequestException('Allocation exceeds invoice balance');
    await tx.payment.create({ data: { invoiceId, amount: delta, date: doc.date, method: delta < 0 ? 'ALLOCATION_REVERSAL' : 'ALLOCATION', reference: `WORKFLOW:${doc.id}`, createdBy: doc.createdBy } });
    await tx.invoice.update({ where: { id: invoiceId }, data: { amountPaid: paid, status: paid >= due - 0.000001 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID' } });
  }
  private async customerFunds(tx: Tx, doc: WorkflowDocument, body: any) {
    if (doc.kind === 'CUSTOMER_UNALLOCATE') {
      const allocation = await this.origin(tx, doc, 'CUSTOMER_ALLOCATION');
      if (allocation.status === 'REVERSED') throw new BadRequestException('Allocation was already reversed');
      await this.setPaid(tx, allocation.invoiceId!, -allocation.total, doc);
      const source = await tx.workflowDocument.findUniqueOrThrow({ where: { id: allocation.originId! } });
      if (source.kind === 'SALES_RETURN') await this.setPaid(tx, source.invoiceId!, allocation.total, doc, true);
      await tx.workflowDocument.update({ where: { id: allocation.id }, data: { status: 'REVERSED' } });
      await tx.workflowDocument.update({ where: { id: doc.id }, data: { customerId: allocation.customerId, total: allocation.total } }); return;
    }
    const amount = cash(body.amount);
    if (doc.kind === 'CUSTOMER_RECEIPT') {
      if (!doc.customerId) throw new BadRequestException('Choose a customer');
      await tx.customerLedgerEntry.create({ data: { customerId: doc.customerId, date: doc.date, type: 'ADVANCE', credit: amount, reference: doc.documentNo } });
      await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: 'CASH_BANK', debit: amount }, { account: 'RECEIVABLE', party: `CUSTOMER:${doc.customerId}`, credit: amount }]);
    } else {
      const origin = doc.originId ? await tx.workflowDocument.findUnique({ where: { id: doc.originId } }) : null;
      if (!origin || !['CUSTOMER_RECEIPT', 'SALES_RETURN'].includes(origin.kind) || !origin.customerId) throw new BadRequestException('Choose a customer advance or return credit');
      if (doc.date < origin.date) throw new BadRequestException('Allocation cannot precede its source');
      const used = await tx.workflowDocument.aggregate({ where: { originId: origin.id, status: { not: 'REVERSED' }, kind: { in: ['CUSTOMER_ALLOCATION', 'CUSTOMER_REFUND'] }, id: { not: doc.id } }, _sum: { total: true } });
      let available = origin.total - (used._sum.total || 0);
      let sourceInvoice: any;
      if (origin.kind === 'SALES_RETURN') {
        sourceInvoice = await tx.invoice.findUniqueOrThrow({ where: { id: origin.invoiceId! } });
        available = Math.min(available, Math.max(0, money(sourceInvoice.amountPaid - (sourceInvoice.total - sourceInvoice.creditTotal))));
      }
      if (amount > available + 0.000001) throw new BadRequestException('Amount exceeds unallocated customer credit');
      if (doc.kind === 'CUSTOMER_ALLOCATION') {
        const target = await tx.invoice.findUnique({ where: { id: Number(body.invoiceId) } });
        if (!target || target.status === 'VOID' || target.customerId !== origin.customerId || target.id === sourceInvoice?.id || doc.date < target.date) throw new BadRequestException('Choose another active invoice belonging to this customer');
        await this.setPaid(tx, target.id, amount, doc);
      } else {
        await tx.customerLedgerEntry.create({ data: { customerId: origin.customerId, date: doc.date, type: 'REFUND', debit: amount, reference: doc.documentNo } });
        await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: 'RECEIVABLE', party: `CUSTOMER:${origin.customerId}`, debit: amount }, { account: 'CASH_BANK', credit: amount }]);
      }
      if (sourceInvoice) await this.setPaid(tx, sourceInvoice.id, -amount, doc);
      await tx.workflowDocument.update({ where: { id: doc.id }, data: { customerId: origin.customerId } });
    }
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { total: amount, metadata: JSON.stringify({ method: body.method || 'BANK', reference: body.reference || null }) } });
  }

  private async procurement(tx: Tx, doc: WorkflowDocument, body: any) {
    if (doc.kind === 'PURCHASE_ORDER') {
      if (!doc.supplierId) throw new BadRequestException('Choose a supplier');
      for (const input of this.inputs(body)) {
        if (input.rate === undefined || input.rate === null || String(input.rate).trim() === '') throw new BadRequestException('Enter an agreed unit cost for each purchase line; use an explicit zero only for free material');
        await this.line(tx, doc, input);
      }
      await this.total(tx, doc); return;
    }
    const billSource = doc.kind === 'SUPPLIER_BILL' && doc.originId ? await tx.workflowDocument.findUnique({ where: { id: doc.originId } }) : null;
    const serviceBill = billSource?.kind === 'PURCHASE_ORDER';
    const source = await this.origin(tx, doc, doc.kind === 'GOODS_RECEIPT' || serviceBill ? 'PURCHASE_ORDER' : doc.kind === 'SUPPLIER_BILL' ? 'GOODS_RECEIPT' : 'SUPPLIER_BILL');
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { supplierId: source.supplierId } });
    for (const input of this.inputs(body)) {
      const original = source.lines.find(l => l.id === Number(input.sourceLineId));
      if (!original) throw new BadRequestException('Choose a line from the source document');
      if (serviceBill && original.item.type !== 'SERVICE') throw new BadRequestException('Material purchases must be received before billing; direct purchase-order bills are for services');
      const qty = positive(input.quantity);
      let prior = source.children.filter(d => d.kind === doc.kind).flatMap(d => d.lines).filter(l => l.sourceLineId === original.id).reduce((s, l) => s + l.quantity, 0);
      if (doc.kind === 'GOODS_RECEIPT') {
        const receiptIds = source.children.filter(d => d.kind === 'GOODS_RECEIPT').flatMap(d => d.lines).filter(l => l.sourceLineId === original.id).map(l => l.id);
        const billLines = await tx.workflowLine.findMany({ where: { sourceLineId: { in: receiptIds }, document: { kind: 'SUPPLIER_BILL' } }, select: { id: true } });
        const returned = await tx.workflowLine.aggregate({ where: { sourceLineId: { in: billLines.map(l => l.id) }, document: { kind: 'PURCHASE_RETURN' } }, _sum: { quantity: true } });
        prior -= returned._sum.quantity || 0;
      }
      if (qty > original.quantity - prior + 0.000001) throw new BadRequestException('Quantity exceeds the source line remainder');
      const line = await this.line(tx, doc, { ...input, itemId: original.itemId, rate: original.rate, gstRate: original.gstRate, discount: original.discount * qty / original.quantity }, { lotId: original.lotId });
      if (doc.kind === 'GOODS_RECEIPT') {
        if (original.item.type === 'SERVICE') throw new BadRequestException('Services are billed without warehouse receipt');
        const batchId = `GRN-${doc.id}-${line.id}`, cotton = original.item.type === 'RAW_MATERIAL' && original.item.uom === 'KG';
        const lot = await tx.stockLot.create({ data: { code: cotton ? `COTTON-${batchId}` : batchId, itemId: line.itemId, grade: input.grade || null, colour: input.colour || null, origin: cotton ? `BATCH:${batchId}` : source.documentNo } });
        await tx.workflowLine.update({ where: { id: line.id }, data: { lotId: lot.id } });
        if (cotton) {
          const priorMoves = await tx.stockMovement.count({ where: { itemId: line.itemId, referenceType: { not: 'LEGACY_COTTON' }, quantity: { not: 0 } } });
          if (priorMoves) throw new BadRequestException('Choose a cotton item with batch-led stock; generic stock adjustments cannot supply cotton production');
          const supplier = await tx.supplier.findUniqueOrThrow({ where: { id: source.supplierId! } });
          await tx.inwardBatch.create({ data: { batchId, date: doc.date, supplier: supplier.name, bale: 0, kg: qty, catalogueItemId: line.itemId, unitCost: line.net / qty, createdBy: doc.createdBy } });
          await tx.cottonInventory.create({ data: { date: doc.date, type: 'INWARD', quantity: qty, balance: 0, reference: doc.documentNo, batchId, createdBy: doc.createdBy } });
        } else await this.move(tx, doc, line.itemId, qty, lot.id, line.net / qty);
      }
      if (doc.kind === 'PURCHASE_RETURN') {
        if (original.item.type !== 'SERVICE' && body.returnConfirmed !== true) throw new BadRequestException('Confirm material was returned to the supplier');
        const received = original.sourceLineId ? await tx.workflowLine.findUnique({ where: { id: original.sourceLineId } }) : null;
        const lot = received?.lotId ? await tx.stockLot.findUnique({ where: { id: received.lotId } }) : null;
        if (lot && body.returnHeldConfirmed === true) {
          const held = await tx.stockHold.findMany({ where: { lotId: lot.id, status: 'HELD' }, orderBy: { id: 'asc' } });
          let toReturn = qty;
          for (const hold of held) {
            if (toReturn <= 0) break;
            if (doc.date < hold.createdAt) throw new BadRequestException('Held material cannot be returned before it was quarantined');
            const disposed = Math.min(toReturn, hold.quantity), remainder = hold.quantity - disposed;
            await tx.stockHold.update({ where: { id: hold.id }, data: { status: 'RETURNED_TO_SUPPLIER', releasedAt: doc.date, releasedBy: doc.createdBy } });
            if (remainder > 0.000001) await tx.stockHold.create({ data: { lotId: lot.id, quantity: remainder, reason: `${hold.reason} · remaining after ${doc.documentNo}`, inspectionId: hold.inspectionId, createdBy: doc.createdBy, createdAt: doc.date } });
            toReturn -= disposed;
          }
          await tx.workflowDocument.update({ where: { id: doc.id }, data: { metadata: JSON.stringify({ qualityDisposition: 'RETURN_TO_SUPPLIER', physicalConfirmation: true }) } });
        }
        const receiptDoc = received ? await tx.workflowDocument.findUnique({ where: { id: received.documentId } }) : null;
        const linkedBatch = receiptDoc?.kind === 'LINK_COTTON_RECEIPT' ? JSON.parse(receiptDoc.metadata).batchId : null;
        if (lot?.origin?.startsWith('BATCH:') || linkedBatch) {
          const batchId = linkedBatch || lot!.origin!.slice(6);
          await tx.cottonInventory.create({ data: { date: doc.date, type: 'SUPPLIER_RETURN', quantity: -qty, balance: 0, reference: doc.documentNo, batchId, createdBy: doc.createdBy } });
        } else await this.move(tx, doc, line.itemId, -qty, received?.lotId, original.net / original.quantity);
      }
    }
    const totals = await this.total(tx, doc), party = `SUPPLIER:${source.supplierId}`;
    if (doc.kind === 'SUPPLIER_BILL') await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: serviceBill ? 'MANUFACTURING_OVERHEAD' : 'GOODS_RECEIVED_NOT_BILLED', debit: totals.subtotal }, { account: 'INPUT_GST', debit: totals.tax }, { account: 'PAYABLE', party, credit: totals.total }]);
    if (doc.kind === 'PURCHASE_RETURN') await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: 'PAYABLE', party, debit: totals.total }, { account: source.lines.every(l => l.item.type === 'SERVICE') ? 'MANUFACTURING_OVERHEAD' : 'INVENTORY_CLEARING', credit: totals.subtotal }, { account: 'INPUT_GST', credit: totals.tax }]);
  }
  private async supplierFunds(tx: Tx, doc: WorkflowDocument, body: any) {
    const amount = cash(body.amount);
    if (doc.kind === 'SUPPLIER_PAYMENT') {
      if (!doc.supplierId) throw new BadRequestException('Choose a supplier');
      await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: 'PAYABLE', party: `SUPPLIER:${doc.supplierId}`, debit: amount }, { account: 'CASH_BANK', credit: amount }]);
    } else if (['SUPPLIER_CREDIT_ALLOCATION', 'SUPPLIER_REFUND'].includes(doc.kind)) {
      const credit = await this.origin(tx, doc, 'PURCHASE_RETURN');
      const bill = await tx.workflowDocument.findUniqueOrThrow({ where: { id: credit.originId! }, include: { children: true } });
      const credits = bill.children.filter(d => d.kind === 'PURCHASE_RETURN').reduce((s, d) => s + d.total, 0);
      const used = credit.children.reduce((s, d) => s + d.total, 0);
      const available = Math.min(credit.total - used, Math.max(0, bill.amountPaid - (bill.total - credits)));
      if (amount > available + 0.000001) throw new BadRequestException('Amount exceeds the available supplier return credit');
      await tx.workflowDocument.update({ where: { id: bill.id }, data: { amountPaid: money(bill.amountPaid - amount) } });
      if (doc.kind === 'SUPPLIER_CREDIT_ALLOCATION') {
        const target = await tx.workflowDocument.findUnique({ where: { id: Number(body.billId) }, include: { children: true } });
        const targetCredits = target?.children.filter(d => d.kind === 'PURCHASE_RETURN').reduce((s, d) => s + d.total, 0) || 0;
        if (!target || !['SUPPLIER_BILL', 'TRANSFORM_RECEIPT'].includes(target.kind) || target.supplierId !== bill.supplierId || target.id === bill.id || doc.date < target.date || amount > target.total - target.amountPaid - targetCredits + 0.000001) throw new BadRequestException('Choose another bill or work charge with enough balance from this supplier');
        await tx.workflowDocument.update({ where: { id: target.id }, data: { amountPaid: money(target.amountPaid + amount) } });
      } else await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: 'CASH_BANK', debit: amount }, { account: 'PAYABLE', party: `SUPPLIER:${bill.supplierId}`, credit: amount }]);
      await tx.workflowDocument.update({ where: { id: doc.id }, data: { supplierId: bill.supplierId, metadata: JSON.stringify({ billId: body.billId || null }) } });
    } else {
      const source = await this.origin(tx, doc, 'SUPPLIER_PAYMENT');
      const bill = await tx.workflowDocument.findUnique({ where: { id: Number(body.billId) }, include: { children: true } });
      if (!bill || !['SUPPLIER_BILL', 'TRANSFORM_RECEIPT'].includes(bill.kind) || bill.supplierId !== source.supplierId || doc.date < bill.date) throw new BadRequestException('Choose a bill or work charge from the same supplier');
      const used = source.children.filter(d => d.kind === 'SUPPLIER_ALLOCATION').reduce((s, d) => s + d.total, 0);
      const credits = bill.children.filter(d => d.kind === 'PURCHASE_RETURN').reduce((s, d) => s + d.total, 0);
      if (amount > source.total - used + 0.000001 || amount > bill.total - bill.amountPaid - credits + 0.000001) throw new BadRequestException('Allocation exceeds payment credit or bill balance');
      await tx.workflowDocument.update({ where: { id: bill.id }, data: { amountPaid: money(bill.amountPaid + amount) } });
      await tx.workflowDocument.update({ where: { id: doc.id }, data: { supplierId: source.supplierId, metadata: JSON.stringify({ billId: bill.id }) } });
    }
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { total: amount } });
  }

  private async linkCottonReceipt(tx: Tx, doc: WorkflowDocument, body: any) {
    const batch = await tx.inwardBatch.findUnique({ where: { id: Number(body.inwardId) } });
    if (!batch || !doc.supplierId || !body.notes?.trim() || body.rate === undefined || body.rate === '') throw new BadRequestException('Choose a cotton receipt and supplier, and record its verified unit cost and evidence');
    if (doc.date < batch.date) throw new BadRequestException('The accounting link cannot precede the physical receipt');
    const existing = await tx.workflowDocument.findMany({ where: { kind: 'LINK_COTTON_RECEIPT', id: { not: doc.id } } });
    if (existing.some(d => JSON.parse(d.metadata).batchId === batch.batchId) || batch.catalogueItemId) throw new BadRequestException('This receipt is already linked to procurement');
    const item = batch.catalogueItemId ? await tx.catalogueItem.findUnique({ where: { id: batch.catalogueItemId } }) : await tx.catalogueItem.findUnique({ where: { sku: `LEGACY-COTTON-${batch.batchId}` } });
    if (!item || batch.isMerged || batch.supplier === 'Internal waste recycling') throw new BadRequestException('Choose an original supplier receipt');
    const quantityRows = await tx.cottonInventory.findMany({ where: { batchId: batch.batchId, type: 'INWARD', quantity: { gt: 0 } } });
    if (!quantityRows.length) throw new BadRequestException('Original cotton receipt movements are missing');
    const rate = nonnegative(body.rate, 'Verified unit cost'), lot = await tx.stockLot.findUnique({ where: { code: `ITEM-${item.id}` } });
    for (const row of quantityRows) {
      const movements = await tx.stockMovement.findMany({ where: { referenceType: 'LEGACY_COTTON', referenceId: String(row.id), quantity: { gt: 0 } } });
      for (const movement of movements) {
        if (await tx.journalEntry.findUnique({ where: { sourceKey: `STOCK:${movement.id}` } })) {
          const valued = await tx.stockValuation.findUnique({ where: { movementId: movement.id } });
          if (valued?.unitCost === null || Math.abs((valued?.unitCost || 0) - rate) > 0.000001) throw new BadRequestException('Verified bill cost differs from posted receipt cost; retain its original valuation');
        } else { await assertOpenPeriod(tx, movement.date); await tx.stockMovement.update({ where: { id: movement.id }, data: { unitCost: rate } }); }
      }
    }
    await tx.inwardBatch.update({ where: { id: batch.id }, data: { unitCost: rate } });
    await this.line(tx, doc, { itemId: item.id, quantity: batch.kg, rate, gstRate: body.gstRate || 0, lotId: lot?.id });
    await this.total(tx, doc);
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { metadata: JSON.stringify({ batchId: batch.batchId, receiptDate: batch.date, evidence: body.notes }) } });
  }

  private async hold(tx: Tx, doc: WorkflowDocument, body: any) {
    const lot = await tx.stockLot.findUnique({ where: { id: Number(body.lotId) } });
    if (!lot || !body.notes?.trim()) throw new BadRequestException('Choose a lot and enter the reason for quarantine');
    const quantity = positive(body.quantity);
    await freezeOrdersForHold(tx, lot.itemId, quantity, doc.createdBy);
    await tx.stockHold.create({ data: { lotId: lot.id, quantity, reason: body.notes.trim(), createdBy: doc.createdBy, createdAt: doc.date } });
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { metadata: JSON.stringify({ lotId: lot.id, quantity }) } });
  }
  async releaseHold(id: number, body: any, actor: string) {
    if (typeof body?.notes !== 'string' || !body.notes.trim()) throw new BadRequestException('Record the inspection/release decision');
    return this.prisma.stockTransaction(async tx => {
      await assertOpenPeriod(tx, new Date());
      const hold = await tx.stockHold.findUniqueOrThrow({ where: { id } });
      if (hold.status === 'RELEASED') return hold;
      if (hold.status !== 'HELD') throw new BadRequestException('This hold was already disposed of; it cannot be inspected and released');
      await tx.qualityInspection.create({ data: { lotId: hold.lotId, holdQuantity: hold.quantity, status: 'PASS', disposition: 'RELEASE', inspectedBy: actor, remarks: body.notes.trim() } });
      await tx.activityLog.create({ data: { username: actor, module: 'QUALITY', action: 'RELEASE', details: `Hold ${id} · ${body.notes.trim()}` } });
      return tx.stockHold.update({ where: { id }, data: { status: 'RELEASED', releasedBy: actor, releasedAt: new Date() } });
    });
  }
  private async reclassify(tx: Tx, doc: WorkflowDocument, body: any) {
    const source = await tx.stockLot.findUniqueOrThrow({ where: { id: Number(body.lotId) } });
    const quantity = positive(body.quantity);
    const lot = await tx.stockLot.create({ data: { code: body.lotCode?.trim() || `LOT-${doc.id}`, itemId: source.itemId, grade: body.grade || null, colour: body.colour || null, owner: source.owner, origin: source.code } });
    const cost = await tx.stockMovement.findMany({ where: { itemId: source.itemId }, include: { valuation: true } });
    const qty = cost.reduce((s, m) => s + m.quantity, 0), value = cost.reduce((s, m) => s + (m.valuation?.value || 0), 0);
    if (cost.some(m => m.valuation?.status === 'UNVALUED')) throw new BadRequestException('Set the source purchase cost before reclassifying valued stock');
    await this.move(tx, doc, source.itemId, -quantity, source.id);
    await this.move(tx, doc, source.itemId, quantity, lot.id, qty ? value / qty : 0);
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { metadata: JSON.stringify({ sourceLotId: source.id, lotId: lot.id, quantity }) } });
  }
  private async completeWip(tx: Tx, doc: WorkflowDocument, body: any) {
    const lot = await tx.wipLot.findUnique({ where: { id: Number(body.wipId) } });
    if (!lot || lot.status !== 'OPEN' || doc.date < lot.date) throw new BadRequestException('Choose an open intermediate lot');
    const consumed = positive(body.quantity), loss = nonnegative(body.loss, 'Process loss');
    await assertOverheadAvailable(tx, nonnegative(body.processingCost), doc.date);
    if (consumed > lot.remaining + 0.000001) throw new BadRequestException('Consumption exceeds remaining intermediate stock');
    let output = 0;
    const outputInputs = Array.isArray(body.lines) && body.lines.length ? this.inputs(body) : [];
    if (!outputInputs.length && Math.abs(consumed - loss) > 0.01) throw new BadRequestException('Record output quantities or explicitly account for the entire consumed lot as process loss');
    for (const input of outputInputs) {
      const item = await tx.catalogueItem.findUniqueOrThrow({ where: { id: Number(input.itemId) } });
      if (item.type === 'SERVICE' || item.uom !== 'KG') throw new BadRequestException('Intermediate completion outputs use kilograms');
      const line = await this.line(tx, doc, input); output += line.quantity;
      const outputLot = await tx.stockLot.create({ data: { code: `WIP-OUT-${doc.id}-${line.id}`, itemId: line.itemId, origin: lot.code } });
      await this.move(tx, doc, line.itemId, line.quantity, outputLot.id, lot.unitCost === null ? null : (lot.unitCost * consumed + nonnegative(body.processingCost)) / (consumed - loss));
      await tx.workflowLine.update({ where: { id: line.id }, data: { lotId: outputLot.id } });
    }
    if (Math.abs(consumed - output - loss) > 0.01) throw new BadRequestException('Intermediate input must equal finished output plus process loss');
    const remaining = Math.max(0, lot.remaining - consumed);
    await tx.wipLot.update({ where: { id: lot.id }, data: { remaining, status: remaining < 0.000001 ? 'COMPLETED' : 'OPEN' } });
    const destination = output > 0 ? 'INVENTORY_CLEARING' : 'PROCESS_LOSS';
    if (lot.unitCost !== null) await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: destination, debit: money(lot.unitCost * consumed) }, { account: 'WIP', credit: money(lot.unitCost * consumed) }]);
    await journal(tx, `WIP_OVERHEAD:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: destination, debit: nonnegative(body.processingCost) }, { account: 'MANUFACTURING_OVERHEAD', credit: nonnegative(body.processingCost) }]);
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { metadata: JSON.stringify({ wipId: lot.id, consumed, loss, output, processingCost: nonnegative(body.processingCost) }) } });
  }

  private async transform(tx: Tx, doc: WorkflowDocument, body: any) {
    if (doc.kind === 'TRANSFORM_DISPATCH') {
      if (!doc.supplierId || !body.outputItemId) throw new BadRequestException('Choose the job worker and output item');
      const output = await tx.catalogueItem.findUniqueOrThrow({ where: { id: Number(body.outputItemId) } });
      if (output.type === 'SERVICE' || !output.active) throw new BadRequestException('Choose a stock output item');
      const expectedOutput = positive(body.expectedOutput), tolerance = nonnegative(body.yieldTolerance ?? 5, 'Yield tolerance');
      if (tolerance > 100) throw new BadRequestException('Yield tolerance cannot exceed 100%');
      const seen = new Set<number>();
      for (const input of this.inputs(body)) {
        if (seen.has(Number(input.itemId))) throw new BadRequestException('Combine duplicate input materials'); seen.add(Number(input.itemId));
        const line = await this.line(tx, doc, input, { direction: 'OUT' });
        await this.move(tx, doc, line.itemId, -line.quantity, line.lotId);
      }
      const inputs = await tx.workflowLine.findMany({ where: { documentId: doc.id }, include: { item: true } });
      if (output.uom === 'KG' && inputs.every(l => l.item.uom === 'KG') && expectedOutput > inputs.reduce((s, l) => s + l.quantity, 0) + 0.01) throw new BadRequestException('Expected kilogram output cannot exceed supplied kilograms');
      await tx.workflowDocument.update({ where: { id: doc.id }, data: { status: 'DISPATCHED', metadata: JSON.stringify({ outputItemId: output.id, expectedOutput, yieldTolerance: tolerance, charge: nonnegative(body.charge), ownership: 'COMPANY', process: body.process || 'CONVERSION' }) } }); return;
    }
    const source = await this.origin(tx, doc, 'TRANSFORM_DISPATCH'), meta = JSON.parse(source.metadata);
    const receipts = source.children.filter(d => d.kind === 'TRANSFORM_RECEIPT'), returned = source.children.some(d => d.kind === 'TRANSFORM_CANCEL');
    if (returned || source.status === 'COMPLETED') throw new BadRequestException('Conversion work is already closed');
    const used = (id: number) => receipts.flatMap(d => d.lines).filter(l => l.direction === 'OUT' && l.sourceLineId === id).reduce((s, l) => s + l.quantity, 0);
    if (doc.kind === 'TRANSFORM_CANCEL') {
      if (body.returnConfirmed !== true) throw new BadRequestException('Confirm outstanding input materials were returned');
      for (const original of source.lines) {
        const qty = original.quantity - used(original.id);
        const issues = await tx.stockMovement.findMany({ where: { referenceType: 'TRANSFORM_DISPATCH', referenceId: String(source.id), itemId: original.itemId }, include: { valuation: true } });
        const unitCost = issues.length && issues.every(m => m.valuation?.status === 'VALUED') ? -issues.reduce((s, m) => s + (m.valuation?.value || 0), 0) / original.quantity : null;
        if (qty > 0.000001) { await this.line(tx, doc, { ...original, quantity: qty, sourceLineId: original.id }); await this.move(tx, doc, original.itemId, qty, original.lotId, unitCost); }
      }
      await tx.workflowDocument.update({ where: { id: source.id }, data: { status: 'CANCELLED' } }); return;
    }
    let consumed = 0;
    for (const input of this.inputs(body)) {
      const original = source.lines.find(l => l.id === Number(input.sourceLineId));
      if (!original) throw new BadRequestException('Consumption must use a supplied material line');
      const qty = positive(input.quantity);
      if (qty > original.quantity - used(original.id) + 0.000001) throw new BadRequestException('Consumption exceeds outstanding job material');
      consumed += qty;
      await this.line(tx, doc, { ...input, itemId: original.itemId }, { direction: 'OUT', sourceLineId: original.id });
    }
    const outputQty = positive(body.outputQuantity), loss = nonnegative(body.loss), outputItem = await tx.catalogueItem.findUniqueOrThrow({ where: { id: meta.outputItemId } });
    const sameUnit = source.lines.every(l => l.item.uom === outputItem.uom);
    if (sameUnit && Math.abs(consumed - outputQty - loss) > 0.01) throw new BadRequestException('Conversion input must equal output plus process loss');
    const beforeOut = receipts.reduce((s, d) => s + Number(JSON.parse(d.metadata).outputQuantity || 0), 0);
    const allLines = await tx.workflowLine.findMany({ where: { document: { originId: source.id, kind: 'TRANSFORM_RECEIPT' }, direction: 'OUT' } });
    const complete = source.lines.every(l => allLines.filter(x => x.sourceLineId === l.id).reduce((s, x) => s + x.quantity, 0) >= l.quantity - 0.000001);
    if (beforeOut + outputQty > meta.expectedOutput * (1 + meta.yieldTolerance / 100) + 0.000001 || (complete && beforeOut + outputQty < meta.expectedOutput * (1 - meta.yieldTolerance / 100) - 0.000001)) throw new BadRequestException('Conversion yield falls outside the agreed tolerance');
    const charge = nonnegative(body.charge);
    const priorCharge = receipts.reduce((s, d) => s + d.total, 0);
    if (priorCharge + charge > meta.charge + 0.000001) throw new BadRequestException('Work charges exceed the agreed contract');
    const costs = await tx.stockMovement.findMany({ where: { referenceType: 'TRANSFORM_DISPATCH', referenceId: String(source.id) }, include: { valuation: true } });
    const consumedLines = await tx.workflowLine.findMany({ where: { documentId: doc.id, direction: 'OUT' } });
    const materialCost = costs.length && costs.every(m => m.valuation?.status === 'VALUED') ? consumedLines.reduce((sum, line) => {
      const original = source.lines.find(l => l.id === line.sourceLineId)!;
      const dispatchedValue = -costs.filter(m => m.itemId === line.itemId).reduce((s, m) => s + (m.valuation?.value || 0), 0);
      return sum + dispatchedValue * line.quantity / original.quantity;
    }, 0) : null;
    const lot = await tx.stockLot.create({ data: { code: `CONVERT-${doc.id}`, itemId: outputItem.id, origin: source.documentNo } });
    await this.line(tx, doc, { itemId: outputItem.id, quantity: outputQty, lotId: lot.id }, { direction: 'IN' });
    await this.move(tx, doc, outputItem.id, outputQty, lot.id, materialCost === null ? null : (materialCost + charge) / outputQty);
    if (charge) await journal(tx, `WORKFLOW:${doc.id}`, doc.date, doc.documentNo, doc.createdBy, [{ account: 'SUBCONTRACT_MATERIAL', debit: charge }, { account: 'PAYABLE', party: `SUPPLIER:${source.supplierId}`, credit: charge }]);
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { supplierId: source.supplierId, total: charge, metadata: JSON.stringify({ outputQuantity: outputQty, loss, materialCost, charge }) } });
    await tx.workflowDocument.update({ where: { id: source.id }, data: { status: complete ? 'COMPLETED' : 'PART_RECEIVED' } });
  }

  private async orderDispatch(tx: Tx, doc: WorkflowDocument, body: any) {
    if (doc.kind === 'DISPATCH_RETURN') {
      const source = await this.origin(tx, doc, 'ORDER_DISPATCH');
      if (body.returnConfirmed !== true || source.status === 'RETURNED') throw new BadRequestException('Confirm physical return of an active dispatch');
      if (await tx.invoice.count({ where: { fulfilmentId: source.id, status: { not: 'VOID' } } })) throw new BadRequestException('Credit or void dependent invoices first; invoiced partial returns use Sales return');
      const order = await tx.salesOrder.findUniqueOrThrow({ where: { id: source.orderId! }, include: { lines: true } });
      for (const line of source.lines) {
        await this.move(tx, doc, line.itemId, line.quantity, line.lotId);
        const original = order.lines.find(l => l.itemId === line.itemId)!;
        await tx.salesOrderLine.update({ where: { id: original.id }, data: { dispatchedQty: { decrement: line.quantity } } });
        if (!['CANCELLED', 'CANCELLED_PARTIAL', 'ON_HOLD'].includes(order.status)) await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: 0, reservedQty: line.quantity, movementType: 'SALES_RESERVE', referenceType: 'SALES_ORDER', referenceId: String(order.id), date: doc.date } });
      }
      await tx.workflowDocument.update({ where: { id: source.id }, data: { status: 'RETURNED' } }); return;
    }
    const order = await tx.salesOrder.findUnique({ where: { id: Number(body.orderId) }, include: { lines: { include: { item: true } } } });
    if (!order || !['CONFIRMED', 'PARTIALLY_INVOICED'].includes(order.status)) throw new BadRequestException('Choose an open sales order');
    if (doc.date < order.date) throw new BadRequestException('Dispatch cannot precede its sales order');
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { customerId: order.customerId } });
    for (const input of this.inputs(body)) {
      const original = order.lines.find(l => l.id === Number(input.sourceLineId));
      if (!original || original.item.type === 'SERVICE') throw new BadRequestException('Choose a material line from this order');
      const qty = positive(input.quantity);
      if (qty > original.quantity - Math.max(original.dispatchedQty, original.invoicedQty) + 0.000001) throw new BadRequestException('Dispatch exceeds the order remainder');
      await this.line(tx, doc, { ...input, itemId: original.itemId, rate: original.rate, gstRate: original.gstRate, discount: original.discount * qty / original.quantity });
      await this.move(tx, doc, original.itemId, -qty, input.lotId ? Number(input.lotId) : null);
      await tx.stockMovement.create({ data: { itemId: original.itemId, quantity: 0, reservedQty: -qty, movementType: 'SALES_RELEASE', referenceType: 'SALES_ORDER', referenceId: String(order.id), date: doc.date } });
      await tx.salesOrderLine.update({ where: { id: original.id }, data: { dispatchedQty: { increment: qty } } });
    }
    await this.total(tx, doc);
  }
  private async pick(tx: Tx, doc: WorkflowDocument, body: any) {
    if (!body.orderId) throw new BadRequestException('Pick against a sales order');
    const order = await tx.salesOrder.findUniqueOrThrow({ where: { id: Number(body.orderId) }, include: { lines: true } });
    if (!['CONFIRMED', 'PARTIALLY_INVOICED'].includes(order.status)) throw new BadRequestException('Choose an open order that has passed quality review');
    if (doc.date < order.date) throw new BadRequestException('Picking cannot precede its sales order');
    for (const input of this.inputs(body)) {
      const original = order.lines.find(l => l.itemId === Number(input.itemId));
      const quantity = positive(input.quantity), locationId = Number(input.locationId);
      if (!original || quantity > original.quantity - Math.max(original.invoicedQty, original.dispatchedQty) + 0.000001) throw new BadRequestException('Pick exceeds the order remainder');
      const picked = await tx.workflowLine.aggregate({ where: { sourceLineId: original.id, document: { kind: 'PICK', orderId: order.id } }, _sum: { quantity: true } });
      if (quantity > original.quantity - (picked._sum.quantity || 0) + 0.000001) throw new BadRequestException('This quantity was already picked for packing; the cumulative pick exceeds the order');
      const location = await tx.warehouseLocation.findUnique({ where: { id: locationId } });
      const rows = await tx.warehouseMovement.findMany({ where: { itemId: original.itemId, locationId } });
      const balance = rows.reduce((s, r) => s + (r.movementType === 'IN' ? r.quantity : -r.quantity), 0);
      if (!location?.active || quantity > balance + 0.000001) throw new BadRequestException('Insufficient stock at the chosen warehouse location');
      await tx.warehouseMovement.create({ data: { itemId: original.itemId, locationId, quantity, movementType: 'OUT', referenceId: `PICK:${doc.id}:SO:${order.id}`, notes: body.notes || 'Released for packing/dispatch', createdBy: doc.createdBy } });
      await this.line(tx, doc, input, { sourceLineId: original.id });
    }
  }
  private async valueOpening(tx: Tx, doc: WorkflowDocument, body: any) {
    if (!body.movementId || !body.notes?.trim() || body.rate === undefined || body.rate === '') throw new BadRequestException('Choose one unvalued receipt and enter its verified cost evidence');
    const row = await tx.stockMovement.findUnique({ where: { id: Number(body.movementId) }, include: { valuation: true } });
    const rate = nonnegative(body.rate, 'Verified unit cost');
    if (!row || row.quantity <= 0 || row.valuation?.status !== 'UNVALUED') throw new BadRequestException('Choose an unvalued external receipt');
    if (['WIP_COMPLETION', 'TRANSFORM_RECEIPT', 'TRANSFORM_CANCEL', 'SALES_RETURN', 'DISPATCH_RETURN', 'JOB_WORK', 'LEGACY_YARN'].includes(row.referenceType || '') || row.movementType === 'INVOICE_REVERSAL') throw new BadRequestException('This receipt derives its cost from the original material or issue; resolve that source cost instead');
    if (await tx.journalEntry.findUnique({ where: { sourceKey: `STOCK:${row.id}` } })) throw new BadRequestException('This receipt already has posted costing');
    await assertOpenPeriod(tx, row.date);
    if (doc.date < row.date) throw new BadRequestException('Cost evidence cannot precede its receipt');
    await tx.stockMovement.update({ where: { id: row.id }, data: { unitCost: rate } });
    await tx.workflowDocument.update({ where: { id: doc.id }, data: { metadata: JSON.stringify({ movementId: row.id, itemId: row.itemId, rate, evidence: body.notes }) } });
  }
  async closePeriod(body: any, actor: string) {
    const through = new Date(body.through); through.setHours(23, 59, 59, 999);
    if (!Number.isFinite(through.getTime()) || through >= new Date() || !body.notes?.trim()) throw new BadRequestException('Choose a completed day and record the closure reason');
    return this.prisma.stockTransaction(async tx => {
      const latest = await tx.accountingPeriod.findFirst({ orderBy: { through: 'desc' } });
      if (latest && through <= latest.through) return latest;
      const incomplete = await tx.stockValuation.count({ where: { status: 'UNVALUED', movement: { date: { lte: through } } } });
      if (incomplete) throw new BadRequestException('Resolve missing stock costs before closing books');
      const lines = await tx.journalLine.findMany({ where: { entry: { date: { lte: through } } } });
      if (money(lines.reduce((s, l) => s + l.debit - l.credit, 0))) throw new BadRequestException('Trial balance is not balanced');
      await tx.activityLog.create({ data: { username: actor, module: 'ACCOUNTING', action: 'PERIOD_CLOSE', details: `${through.toISOString()} · ${body.notes}` } });
      return tx.accountingPeriod.create({ data: { through, closedBy: actor, reason: body.notes } });
    });
  }
  async amendOrder(id: number, body: any, actor: string) {
    return this.prisma.stockTransaction(async tx => {
      const order = await tx.salesOrder.findUniqueOrThrow({ where: { id }, include: { lines: true, invoices: true } });
      await assertOpenPeriod(tx, order.date);
      if (order.invoices.some(i => i.status !== 'VOID') || order.lines.some(l => l.dispatchedQty > 0) || !['CONFIRMED', 'PARTIALLY_INVOICED'].includes(order.status)) throw new BadRequestException('Amend terms before dispatch/invoicing; later concessions require a credit note');
      if (!body.notes?.trim()) throw new BadRequestException('Record why the contract is changing');
      const discount = nonnegative(body.discount);
      if (discount > order.subtotal) throw new BadRequestException('Discount exceeds the order subtotal');
      const taxable = order.subtotal - discount;
      const gst = order.lines.reduce((s, l) => s + (l.quantity * l.rate - l.discount) / (order.subtotal || 1) * taxable * l.gstRate / 100, 0);
      await tx.activityLog.create({ data: { username: actor, module: 'SALES_ORDER', action: 'AMEND', details: `Order ${id}: discount ${order.discount} → ${discount} · ${body.notes}` } });
      return tx.salesOrder.update({ where: { id }, data: { discount, total: money(taxable + gst), notes: [order.notes, body.notes].filter(Boolean).join('\n') } });
    });
  }
}
