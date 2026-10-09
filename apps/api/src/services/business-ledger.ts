import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
type Tx = Prisma.TransactionClient;
export async function unavailableStock(tx: Pick<Tx, 'stockHold' | 'stockMovement'>, itemId: number) {
  const held = await tx.stockHold.aggregate({ where: { status: 'HELD', lot: { itemId } }, _sum: { quantity: true } });
  const owned = await tx.stockMovement.aggregate({ where: { itemId, lot: { owner: { not: 'COMPANY' } } }, _sum: { quantity: true } });
  return Number(held._sum.quantity || 0) + Number(owned._sum.quantity || 0);
}

/** Quarantine takes priority over reservations made before inspection. */
export async function freezeOrdersForHold(tx: Tx, itemId: number, additionalHeld: number, actor: string) {
  const physical = await tx.stockMovement.aggregate({ where: { itemId }, _sum: { quantity: true, reservedQty: true } });
  if (Number(physical._sum.quantity || 0) - Number(physical._sum.reservedQty || 0) - await unavailableStock(tx, itemId) - additionalHeld >= -0.000001) return;
  const reservations = await tx.stockMovement.groupBy({ by: ['referenceId'], where: { itemId, referenceType: 'SALES_ORDER' }, _sum: { reservedQty: true } });
  for (const reservation of reservations) {
    if ((reservation._sum.reservedQty || 0) <= 0.000001 || !reservation.referenceId) continue;
    const order = await tx.salesOrder.findUnique({ where: { id: Number(reservation.referenceId) } });
    if (!order || ['CANCELLED', 'CANCELLED_PARTIAL', 'INVOICED'].includes(order.status)) continue;
    const all = await tx.stockMovement.groupBy({ by: ['itemId'], where: { referenceType: 'SALES_ORDER', referenceId: String(order.id) }, _sum: { reservedQty: true } });
    for (const line of all) if ((line._sum.reservedQty || 0) > 0.000001) await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: 0, reservedQty: -(line._sum.reservedQty || 0), movementType: 'QUALITY_RESERVATION_RELEASE', referenceType: 'SALES_ORDER', referenceId: String(order.id), notes: 'Order held pending quality inspection and re-reservation', createdBy: actor } });
    await tx.salesOrder.update({ where: { id: order.id }, data: { status: 'ON_HOLD' } });
    await tx.activityLog.create({ data: { action: 'QUALITY_HOLD', module: 'SALES_ORDER', username: actor, details: `Order ${order.orderNo} paused; reserved stock failed inspection` } });
  }
}

export async function assertOpenPeriod(tx: Tx, date: Date) {
  if (!Number.isFinite(date.getTime())) throw new BadRequestException('Enter a valid posting date');
  const closed = await tx.accountingPeriod.findFirst({ orderBy: { through: 'desc' } });
  if (closed && date <= closed.through) throw new BadRequestException(`Books are closed through ${closed.through.toISOString().slice(0, 10)}. Post a correction in an open period.`);
}

export async function assertOverheadAvailable(tx: Tx, amount: number, date: Date) {
  if (!amount) return;
  const entries = await tx.journalLine.aggregate({ where: { account: 'MANUFACTURING_OVERHEAD', entry: { date: { lte: date } } }, _sum: { debit: true, credit: true } });
  const available = money((entries._sum.debit || 0) - (entries._sum.credit || 0));
  if (amount > available + 0.000001) throw new BadRequestException(`Only ₹${available.toFixed(2)} of recorded overhead is available. Record the underlying expense or payroll before allocating its cost.`);
}

export async function journal(tx: Tx, sourceKey: string, date: Date, description: string, createdBy: string,
  lines: { account: string; debit?: number; credit?: number; party?: string }[]) {
  if (await tx.journalEntry.findUnique({ where: { sourceKey } })) return;
  const normalized = lines.map(l => ({ ...l, debit: money(l.debit || 0), credit: money(l.credit || 0) })).filter(l => l.debit || l.credit);
  if (normalized.some(l => !Number.isFinite(l.debit + l.credit) || l.debit < 0 || l.credit < 0 || (l.debit && l.credit))) throw new BadRequestException('Invalid journal amounts');
  const net = money(normalized.reduce((s, l) => s + l.debit - l.credit, 0));
  if (net !== 0) throw new BadRequestException('Accounting entry must balance');
  if (normalized.length) await tx.journalEntry.create({ data: { sourceKey, date, description, createdBy, lines: { create: normalized } } });
}

/** Assign legacy quantities once; new unlabelled issues pick released company lots. */
export async function reconcileLots(tx: Tx) {
  const rows = await tx.stockMovement.findMany({ where: { lotId: null, quantity: { not: 0 } }, orderBy: [{ date: 'asc' }, { id: 'asc' }] });
  for (const row of rows) {
    const code = `ITEM-${row.itemId}`;
    const base = await tx.stockLot.upsert({ where: { code }, create: { code, itemId: row.itemId, origin: 'Existing inventory' }, update: {} });
    const sourceNet = row.referenceType?.startsWith('LEGACY_') ? await tx.stockMovement.aggregate({ where: { itemId: row.itemId, referenceType: row.referenceType, referenceId: row.referenceId }, _sum: { quantity: true } }) : null;
    // Removed imported rows and their corrections belong to the same historical lot.
    // Assign the pair before eligibility checks so equal-time corrections do not look like a new issue.
    if (row.quantity >= 0 || row.movementType === 'RECONCILIATION' || (sourceNet && Math.abs(sourceNet._sum.quantity || 0) < 0.000001)) {
      await tx.stockMovement.update({ where: { id: row.id }, data: { lotId: base.id } });
      continue;
    }
    const lots = await tx.stockLot.findMany({ where: { itemId: row.itemId, owner: 'COMPANY' }, include: { holds: { where: { status: 'HELD' } } }, orderBy: { id: 'asc' } });
    let remaining = -row.quantity, first = true;
    for (const lot of lots) {
      const sum = await tx.stockMovement.aggregate({ where: { lotId: lot.id, date: { lte: row.date } }, _sum: { quantity: true } });
      const free = Math.max(0, (sum._sum.quantity || 0) - lot.holds.reduce((s, h) => s + h.quantity, 0));
      const qty = Math.min(free, remaining);
      if (qty <= 0.000001) continue;
      if (first) await tx.stockMovement.update({ where: { id: row.id }, data: { lotId: lot.id, quantity: -qty } });
      else { const { id, createdAt, ...data } = row; await tx.stockMovement.create({ data: { ...data, lotId: lot.id, quantity: -qty, reservedQty: 0 } }); }
      first = false; remaining -= qty;
      if (remaining <= 0.000001) break;
    }
    if (remaining > 0.01) throw new BadRequestException('Not enough released company-owned lot stock. Check holds, ownership and posting dates.');
  }
}

export async function guardLots(tx: Tx, affectedItems?: Set<number>) {
  const lots = await tx.stockLot.findMany({ where: affectedItems ? { itemId: { in: [...affectedItems] } } : {}, include: { holds: true } });
  const heldByItem = new Map<number, number>();
  for (const lot of lots) {
    const held = lot.holds.filter(h => h.status === 'HELD').reduce((s, h) => s + h.quantity, 0);
    const rows = await tx.stockMovement.findMany({ where: { lotId: lot.id }, orderBy: [{ date: 'asc' }, { id: 'asc' }] });
    const groups = new Map<number, number>();
    for (const row of rows) groups.set(row.date.getTime(), (groups.get(row.date.getTime()) || 0) + row.quantity);
    for (const hold of lot.holds) {
      if (!groups.has(hold.createdAt.getTime())) groups.set(hold.createdAt.getTime(), 0);
      if (hold.releasedAt && !groups.has(hold.releasedAt.getTime())) groups.set(hold.releasedAt.getTime(), 0);
    }
    let balance = 0;
    for (const [date, qty] of [...groups].sort((a, b) => a[0] - b[0])) {
      balance += qty;
      const heldThen = lot.holds.filter(h => h.createdAt.getTime() <= date && (!h.releasedAt || h.releasedAt.getTime() > date)).reduce((s, h) => s + h.quantity, 0);
      if (balance - heldThen < -0.01) throw new BadRequestException(`Lot ${lot.code} has insufficient released stock at this posting time. Check receipt and inspection dates.`);
    }
    if (held > balance + 0.01) throw new BadRequestException(`Lot ${lot.code} contains held material; release or inspect it first`);
    heldByItem.set(lot.itemId, (heldByItem.get(lot.itemId) || 0) + held + (lot.owner !== 'COMPANY' ? balance : 0));
  }
  for (const [itemId, held] of heldByItem) {
    const stock = await tx.stockMovement.aggregate({ where: { itemId }, _sum: { quantity: true, reservedQty: true } });
    if ((stock._sum.quantity || 0) - (stock._sum.reservedQty || 0) - held < -0.01) throw new BadRequestException('Held or customer-owned stock cannot cover company sales reservations');
  }
}

/** Source keys make accounting projection safe to repeat. Historic records retain their dates. */
export async function reconcileFinance(tx: Tx) {
  const expenses = await tx.costingEntry.findMany();
  for (const expense of expenses) {
    if (!Number.isFinite(expense.totalCost) || expense.totalCost < 0) throw new BadRequestException('Cost entries need valid non-negative amounts');
    await journal(tx, `COST:${expense.id}`, expense.date, expense.title || expense.category, expense.createdBy || 'SYSTEM', [{ account: 'MANUFACTURING_OVERHEAD', debit: expense.totalCost }, { account: 'ACCRUED_EXPENSES', credit: expense.totalCost }]);
  }
  const payroll = await tx.payrollEntry.findMany();
  for (const pay of payroll) {
    const date = pay.createdAt;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(pay.month)) throw new BadRequestException('Payroll month must use YYYY-MM');
    await journal(tx, `PAYROLL:${pay.id}`, date, `Payroll ${pay.month}`, pay.createdBy || 'SYSTEM', [{ account: 'MANUFACTURING_OVERHEAD', debit: money(pay.basicPay + pay.overtime) }, { account: 'PAYROLL_PAYABLE', party: `STAFF:${pay.staffId}`, credit: pay.netPay }, { account: 'PAYROLL_DEDUCTIONS', credit: pay.deductions }]);
  }
  const productions = await tx.production.findMany();
  for (const p of productions) {
    if (p.totalIntermediate > 0) await tx.wipLot.upsert({ where: { productionId: p.id }, create: { productionId: p.id, code: `WIP-${p.id}`, date: p.date, quantity: p.totalIntermediate, remaining: p.totalIntermediate }, update: {} });
    if (p.processingCost) await journal(tx, `PRODUCTION_COST:${p.id}`, p.date, 'Manufacturing overhead allocated', p.createdBy || 'SYSTEM', [{ account: 'MANUFACTURING_CLEARING', debit: p.processingCost }, { account: 'MANUFACTURING_OVERHEAD', credit: p.processingCost }]);
  }
  const invoices = await tx.invoice.findMany({ where: { customerId: { not: null } }, include: { payments: true } });
  for (const invoice of invoices) {
    const party = `CUSTOMER:${invoice.customerId}`;
    await journal(tx, `INVOICE:${invoice.id}`, invoice.date, invoice.invoiceNo, invoice.createdBy || 'SYSTEM', [
      { account: 'RECEIVABLE', party, debit: invoice.total },
      { account: 'SALES', credit: money(invoice.total - invoice.cgst - invoice.sgst - invoice.igst) },
      { account: 'OUTPUT_CGST', credit: invoice.cgst }, { account: 'OUTPUT_SGST', credit: invoice.sgst }, { account: 'OUTPUT_IGST', credit: invoice.igst },
    ]);
    for (const payment of invoice.payments) {
      if (payment.method === 'ALLOCATION' || payment.method === 'ALLOCATION_REVERSAL') continue;
      const reverse = payment.amount < 0;
      await journal(tx, `PAYMENT:${payment.id}`, payment.date, `Receipt ${invoice.invoiceNo}`, payment.createdBy || 'SYSTEM', [
        { account: 'CASH_BANK', debit: reverse ? 0 : payment.amount, credit: reverse ? -payment.amount : 0 },
        { account: 'RECEIVABLE', party, credit: reverse ? 0 : payment.amount, debit: reverse ? -payment.amount : 0 },
      ]);
    }
    if (invoice.status === 'VOID') {
      const correction = await tx.customerLedgerEntry.findFirst({ where: { reference: invoice.invoiceNo, type: 'CREDIT_NOTE' }, orderBy: { id: 'desc' } });
      await journal(tx, `INVOICE_VOID:${invoice.id}`, correction?.date || invoice.updatedAt, `Void ${invoice.invoiceNo}`, invoice.updatedBy || 'SYSTEM', [
        { account: 'RECEIVABLE', party, credit: invoice.total }, { account: 'SALES', debit: money(invoice.total - invoice.cgst - invoice.sgst - invoice.igst) },
        { account: 'OUTPUT_CGST', debit: invoice.cgst }, { account: 'OUTPUT_SGST', debit: invoice.sgst }, { account: 'OUTPUT_IGST', debit: invoice.igst },
      ]);
    }
  }
}

/** Perpetual moving average; absent purchase costs stay visibly unvalued. */
export async function reconcileValuation(tx: Tx, affectedItems?: Set<number>, pass = 0) {
  let derivedCost = false;
  if (affectedItems) {
    const pending = await tx.stockValuation.findMany({ where: { status: 'UNVALUED' }, include: { movement: { select: { itemId: true } } } });
    for (const value of pending) affectedItems.add(value.movement.itemId);
  }
  const items = await tx.catalogueItem.findMany({ where: { type: { not: 'SERVICE' }, ...(affectedItems ? { id: { in: [...affectedItems] } } : {}) } });
  items.sort((a, b) => (a.type === 'RAW_MATERIAL' ? -1 : 0) - (b.type === 'RAW_MATERIAL' ? -1 : 0) || a.id - b.id);
  for (const item of items) {
    const rows = await tx.stockMovement.findMany({ where: { itemId: item.id }, orderBy: [{ date: 'asc' }, { id: 'asc' }] });
    const neutral = new Set<string>();
    const sourceGroups = new Map<string, typeof rows>();
    for (const row of rows) if (row.referenceType?.startsWith('LEGACY_')) {
      const key = `${row.referenceType}:${row.referenceId}`;
      sourceGroups.set(key, [...(sourceGroups.get(key) || []), row]);
    }
    for (const [key, group] of sourceGroups) if (Math.abs(group.reduce((s, r) => s + r.quantity, 0)) < 0.000001 && group.some(r => r.notes === 'Inventory source removed; imported balance reversed') && !(await tx.journalEntry.count({ where: { sourceKey: { in: group.map(r => `STOCK:${r.id}`) } } }))) neutral.add(key);
    let qty = 0, value = 0, known = true;
    for (const row of rows) {
      if (!row.quantity) continue;
      if (neutral.has(`${row.referenceType}:${row.referenceId}`)) {
        await tx.stockValuation.upsert({ where: { movementId: row.id }, create: { movementId: row.id, quantity: row.quantity, status: 'NEUTRAL', value: 0 }, update: { quantity: row.quantity, status: 'NEUTRAL', value: 0, unitCost: null } });
        continue;
      }
      const existing = await tx.stockValuation.findUnique({ where: { movementId: row.id } });
      let rate = row.quantity > 0 ? row.unitCost ?? existing?.unitCost ?? (item.costPrice > 0 ? item.costPrice : null) : known && qty > 0 ? value / qty : null;
      if (row.quantity > 0 && (['WIP_COMPLETION', 'TRANSFORM_RECEIPT', 'TRANSFORM_CANCEL', 'SALES_RETURN', 'DISPATCH_RETURN'].includes(row.referenceType || '') || row.movementType === 'INVOICE_REVERSAL') && row.unitCost === null) rate = null;
      if (row.quantity > 0 && row.unitCost === null && (['TRANSFORM_RECEIPT', 'TRANSFORM_CANCEL', 'SALES_RETURN', 'DISPATCH_RETURN'].includes(row.referenceType || '') || row.movementType === 'INVOICE_REVERSAL')) {
        let sourceType: string | undefined, sourceId: string | undefined;
        let selectedInputs: { itemId: number; quantity: number; originalQuantity: number }[] = [];
        let charge = 0;
        if (row.movementType === 'INVOICE_REVERSAL') { sourceType = 'INVOICE'; sourceId = row.referenceId || undefined; }
        else if (row.referenceId) {
          const document = await tx.workflowDocument.findUnique({ where: { id: Number(row.referenceId) }, include: { lines: true } });
          if (document?.kind === 'SALES_RETURN' && document.invoiceId) {
            const invoice = await tx.invoice.findUnique({ where: { id: document.invoiceId } });
            if (invoice?.outwardId) {
              const outward = await tx.yarnInventory.findMany({ where: { type: 'OUTWARD', reference: `O-${invoice.outwardId}` } });
              const original = await tx.stockMovement.findMany({ where: { itemId: row.itemId, quantity: { lt: 0 }, referenceType: 'LEGACY_YARN', referenceId: { in: outward.map(m => String(m.id)) } }, include: { valuation: true } });
              const issued = -original.reduce((s, m) => s + m.quantity, 0);
              if (issued && original.every(m => m.valuation?.status === 'VALUED')) rate = -original.reduce((s, m) => s + (m.valuation?.value || 0), 0) / issued;
            } else { sourceType = invoice?.fulfilmentId ? 'ORDER_DISPATCH' : 'INVOICE'; sourceId = String(invoice?.fulfilmentId || document.invoiceId); }
          } else if (document?.originId) {
            sourceType = document.kind === 'DISPATCH_RETURN' ? 'ORDER_DISPATCH' : 'TRANSFORM_DISPATCH'; sourceId = String(document.originId);
            if (document.kind === 'TRANSFORM_RECEIPT') {
              const supplied = await tx.workflowLine.findMany({ where: { documentId: document.originId } });
              selectedInputs = document.lines.filter(l => l.direction === 'OUT').map(l => ({ itemId: l.itemId, quantity: l.quantity, originalQuantity: supplied.find(s => s.id === l.sourceLineId)?.quantity || 0 }));
              charge = Number(JSON.parse(document.metadata).charge || 0);
            }
          }
        }
        if (sourceType && sourceId) {
          const original = await tx.stockMovement.findMany({ where: { referenceType: sourceType, referenceId: sourceId, quantity: { lt: 0 }, ...(selectedInputs.length ? {} : { itemId: row.itemId }) }, include: { valuation: true } });
          const issued = -original.reduce((s, m) => s + m.quantity, 0);
          if (issued && original.every(m => m.valuation?.status === 'VALUED')) rate = selectedInputs.length
            ? (selectedInputs.reduce((s, input) => s - original.filter(m => m.itemId === input.itemId).reduce((v, m) => v + (m.valuation?.value || 0), 0) * input.quantity / input.originalQuantity, 0) + charge) / row.quantity
            : -original.reduce((s, m) => s + (m.valuation?.value || 0), 0) / issued;
        }
        if (rate !== null) { await tx.stockMovement.update({ where: { id: row.id }, data: { unitCost: rate } }); derivedCost = true; }
      }
      if (row.quantity > 0 && row.referenceType === 'JOB_WORK') {
        const dispatch = await tx.stockMovement.findMany({ where: { referenceType: 'JOB_WORK', referenceId: row.referenceId, itemId: row.itemId, movementType: 'JOB_DISPATCH' }, include: { valuation: true } });
        const issued = -dispatch.reduce((s, m) => s + m.quantity, 0);
        rate = dispatch.length && dispatch.every(m => m.valuation?.status === 'VALUED') && issued ? -dispatch.reduce((s, m) => s + (m.valuation?.value || 0), 0) / issued : null;
      }
      if (row.quantity > 0 && row.referenceType === 'WIP_COMPLETION' && row.referenceId && row.unitCost === null) {
        const completion = await tx.workflowDocument.findUnique({ where: { id: Number(row.referenceId) } });
        const meta = completion ? JSON.parse(completion.metadata) : null;
        const wip = meta ? await tx.wipLot.findUnique({ where: { id: meta.wipId } }) : null;
        if (wip?.unitCost !== null && wip?.unitCost !== undefined && meta.output > 0) {
          rate = (wip.unitCost * meta.consumed + Number(meta.processingCost || 0)) / meta.output;
          await tx.stockMovement.update({ where: { id: row.id }, data: { unitCost: rate } }); derivedCost = true;
        }
      }
      if (row.quantity > 0 && row.referenceType === 'LEGACY_YARN' && row.referenceId) {
        const yarn = await tx.yarnInventory.findUnique({ where: { id: Number(row.referenceId) } });
        if (yarn?.type === 'OUTWARD_REVERSAL') {
          const issued = await tx.yarnInventory.findMany({ where: { type: 'OUTWARD', reference: yarn.reference.replace(/-REVERSAL$/, ''), count: yarn.count } });
          const original = await tx.stockMovement.findMany({ where: { referenceType: 'LEGACY_YARN', referenceId: { in: issued.map(i => String(i.id)) }, quantity: { lt: 0 } }, include: { valuation: true } });
          const originalQty = -original.reduce((s, m) => s + m.quantity, 0);
          rate = original.length && original.every(m => m.valuation?.status === 'VALUED') && originalQty ? -original.reduce((s, m) => s + (m.valuation?.value || 0), 0) / originalQty : null;
        }
        if (yarn?.productionId) {
          const production = await tx.production.findUniqueOrThrow({ where: { id: yarn.productionId }, include: { cottonInventory: true } });
          const inputs = await tx.stockMovement.findMany({ where: { referenceType: 'LEGACY_COTTON', referenceId: { in: production.cottonInventory.filter(c => c.quantity < 0).map(c => String(c.id)) } }, include: { valuation: true } });
          const totalCost = -inputs.reduce((s, i) => s + (i.valuation?.value || 0), 0) + production.processingCost;
          rate = inputs.length && inputs.every(i => i.valuation?.status === 'VALUED') ? totalCost / (production.totalProduced + production.totalIntermediate) : null;
          const wip = await tx.wipLot.findUnique({ where: { productionId: production.id } });
          if (wip && rate !== null) {
            await tx.wipLot.update({ where: { id: wip.id }, data: { unitCost: rate } });
            await journal(tx, `WIP:${wip.id}`, production.date, wip.code, production.createdBy || 'SYSTEM', [{ account: 'WIP', debit: money(rate * wip.quantity) }, { account: 'MANUFACTURING_CLEARING', credit: money(rate * wip.quantity) }]);
          }
          if (production.processingCost) await journal(tx, `PRODUCTION_COST:${production.id}`, production.date, 'Manufacturing overhead allocated', production.createdBy || 'SYSTEM', [{ account: 'MANUFACTURING_CLEARING', debit: production.processingCost }, { account: 'MANUFACTURING_OVERHEAD', credit: production.processingCost }]);
        }
      }
      const movementValue = rate === null ? null : money(row.quantity * rate);
      if (movementValue !== null && existing?.status === 'UNVALUED') derivedCost = true;
      qty += row.quantity;
      if (movementValue === null) known = false; else value = money(value + movementValue);
      const data = { quantity: row.quantity, unitCost: rate, value: movementValue, status: movementValue === null ? 'UNVALUED' : 'VALUED' };
      if (existing && ((existing.value ?? null) !== movementValue || existing.quantity !== row.quantity)) {
        // Posted costing is immutable. Correct opening costs before downstream financial posting.
        if (await tx.journalEntry.findUnique({ where: { sourceKey: `STOCK:${row.id}` } })) throw new BadRequestException('This change would rewrite posted inventory cost. Use an open-period correction.');
      }
      await tx.stockValuation.upsert({ where: { movementId: row.id }, create: { movementId: row.id, ...data }, update: data });
      if (movementValue !== null && row.movementType !== 'LOT_RECLASSIFY') {
        const abs = Math.abs(movementValue);
        let offset = ['INVOICE', 'SALES_RETURN', 'ORDER_DISPATCH', 'DISPATCH_RETURN'].includes(row.referenceType || '') ? 'COST_OF_SALES' : row.referenceType === 'GOODS_RECEIPT' ? 'GOODS_RECEIVED_NOT_BILLED' : row.movementType.startsWith('JOB_') || row.referenceType?.startsWith('TRANSFORM_') ? 'SUBCONTRACT_MATERIAL' : row.referenceType?.startsWith('LEGACY_') ? 'MANUFACTURING_CLEARING' : 'INVENTORY_CLEARING';
        if (row.referenceType === 'LEGACY_COTTON' && row.referenceId) {
          const cotton = await tx.cottonInventory.findUnique({ where: { id: Number(row.referenceId) } });
          const batch = cotton?.batchId ? await tx.inwardBatch.findUnique({ where: { batchId: cotton.batchId } }) : null;
          if (cotton?.type === 'INWARD') offset = 'GOODS_RECEIVED_NOT_BILLED';
          if (cotton?.type === 'SUPPLIER_RETURN') offset = 'INVENTORY_CLEARING';
        }
        await journal(tx, `STOCK:${row.id}`, row.date, `${item.sku} · ${row.movementType}`, row.createdBy || 'SYSTEM', [
          { account: 'INVENTORY', debit: movementValue > 0 ? abs : 0, credit: movementValue < 0 ? abs : 0 },
          { account: offset, credit: movementValue > 0 ? abs : 0, debit: movementValue < 0 ? abs : 0 },
        ]);
      }
      if (Math.abs(qty) < 0.000001) { qty = 0; value = 0; known = true; }
    }
  }
  const scraps = await tx.jobWorkReceiptLine.findMany({ where: { scrapQty: { gt: 0 } } });
  for (const scrap of scraps) {
    const dispatch = await tx.stockMovement.findMany({ where: { referenceType: 'JOB_WORK', referenceId: String(scrap.challanId), itemId: scrap.itemId, movementType: 'JOB_DISPATCH' }, include: { valuation: true } });
    const issued = -dispatch.reduce((s, m) => s + m.quantity, 0);
    if (!issued || dispatch.some(m => m.valuation?.status !== 'VALUED')) continue;
    const loss = money(-dispatch.reduce((s, m) => s + (m.valuation?.value || 0), 0) / issued * scrap.scrapQty);
    await journal(tx, `JOB_SCRAP:${scrap.id}`, scrap.createdAt, 'Job-work process loss', 'SYSTEM', [{ account: 'PROCESS_LOSS', debit: loss }, { account: 'SUBCONTRACT_MATERIAL', credit: loss }]);
  }
  const wipLots = await tx.wipLot.findMany({ where: { status: { not: 'CANCELLED' } } });
  for (const wip of wipLots) {
    if (wip.unitCost !== null) continue;
    const p = await tx.production.findUnique({ where: { id: wip.productionId }, include: { cottonInventory: true } });
    if (!p) continue;
    const inputs = await tx.stockMovement.findMany({ where: { referenceType: 'LEGACY_COTTON', referenceId: { in: p.cottonInventory.filter(c => c.quantity < 0).map(c => String(c.id)) } }, include: { valuation: true } });
    if (!inputs.length || inputs.some(i => i.valuation?.status !== 'VALUED')) continue;
    const rate = (-inputs.reduce((s, i) => s + (i.valuation?.value || 0), 0) + p.processingCost) / (p.totalProduced + p.totalIntermediate);
    await tx.wipLot.update({ where: { id: wip.id }, data: { unitCost: rate } });
    derivedCost = true;
    await journal(tx, `WIP:${wip.id}`, p.date, wip.code, p.createdBy || 'SYSTEM', [{ account: 'WIP', debit: money(rate * wip.quantity) }, { account: 'MANUFACTURING_CLEARING', credit: money(rate * wip.quantity) }]);
    if (p.processingCost) await journal(tx, `PRODUCTION_COST:${p.id}`, p.date, 'Manufacturing overhead allocated', p.createdBy || 'SYSTEM', [{ account: 'MANUFACTURING_CLEARING', debit: p.processingCost }, { account: 'MANUFACTURING_OVERHEAD', credit: p.processingCost }]);
  }
  const completions = await tx.workflowDocument.findMany({ where: { kind: 'WIP_COMPLETION' } });
  for (const completion of completions) {
    const meta = JSON.parse(completion.metadata), wip = await tx.wipLot.findUnique({ where: { id: meta.wipId } });
    const overhead = Number(meta.processingCost || 0);
    const destination = meta.output > 0 ? 'INVENTORY_CLEARING' : 'PROCESS_LOSS';
    await journal(tx, `WIP_OVERHEAD:${completion.id}`, completion.date, completion.documentNo, completion.createdBy, [{ account: destination, debit: overhead }, { account: 'MANUFACTURING_OVERHEAD', credit: overhead }]);
    if (!wip || wip.unitCost === null) continue;
    await journal(tx, `WORKFLOW:${completion.id}`, completion.date, completion.documentNo, completion.createdBy, [{ account: destination, debit: money(wip.unitCost * meta.consumed) }, { account: 'WIP', credit: money(wip.unitCost * meta.consumed) }]);
  }
  const losses = await tx.production.findMany({ where: { totalProduced: 0, totalIntermediate: 0 }, include: { cottonInventory: true } });
  for (const production of losses) {
    const inputs = await tx.stockMovement.findMany({ where: { referenceType: 'LEGACY_COTTON', referenceId: { in: production.cottonInventory.filter(c => c.quantity < 0).map(c => String(c.id)) } }, include: { valuation: true } });
    if (!inputs.length || inputs.some(m => m.valuation?.status !== 'VALUED')) continue;
    const loss = money(-inputs.reduce((s, m) => s + (m.valuation?.value || 0), 0) + production.processingCost);
    await journal(tx, `PRODUCTION_LOSS:${production.id}`, production.date, 'Full production process loss', production.createdBy || 'SYSTEM', [{ account: 'PROCESS_LOSS', debit: loss }, { account: 'MANUFACTURING_CLEARING', credit: loss }]);
  }
  const returns = await tx.workflowDocument.findMany({ where: { kind: 'PURCHASE_RETURN' }, include: { lines: { include: { item: true } } } });
  for (const returned of returns) {
    if (returned.lines.every(l => l.item.type === 'SERVICE')) continue;
    const cotton = await tx.cottonInventory.findMany({ where: { type: 'SUPPLIER_RETURN', reference: returned.documentNo } });
    const issues = await tx.stockMovement.findMany({ where: { quantity: { lt: 0 }, OR: [{ referenceType: 'PURCHASE_RETURN', referenceId: String(returned.id) }, { referenceType: 'LEGACY_COTTON', referenceId: { in: cotton.map(c => String(c.id)) } }] }, include: { valuation: true } });
    if (!issues.length || issues.some(m => m.valuation?.status !== 'VALUED')) continue;
    const variance = money(returned.subtotal + issues.reduce((s, m) => s + (m.valuation?.value || 0), 0));
    await journal(tx, `PURCHASE_VARIANCE:${returned.id}`, returned.date, 'Supplier credit versus moving-average issue cost', returned.createdBy, [{ account: 'INVENTORY_CLEARING', debit: variance > 0 ? variance : 0, credit: variance < 0 ? -variance : 0 }, { account: 'PURCHASE_PRICE_VARIANCE', credit: variance > 0 ? variance : 0, debit: variance < 0 ? -variance : 0 }]);
  }
  if (derivedCost && pass < items.length + 1) await reconcileValuation(tx, affectedItems, pass + 1);
}
