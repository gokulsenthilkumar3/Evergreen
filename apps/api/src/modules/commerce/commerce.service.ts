import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../services/prisma.service';
import { calculateInvoiceTotals } from './invoice-totals';
import { stockEventDate } from '../../utils/stock-event-date';
import { assertOpenPeriod, money } from '../../services/business-ledger';

type OrderLineInput = { itemId: number; quantity: number; rate?: number; gstRate?: number; discount?: number };
type InvoiceLineInput = OrderLineInput & { description?: string; hsnSac?: string; uom?: string };

@Injectable()
export class CommerceService {
  constructor(private prisma: PrismaService) {}

  private async stockSummary(tx: any, itemId: number) {
    const result = await tx.stockMovement.aggregate({ where: { itemId }, _sum: { quantity: true, reservedQty: true } });
    const quantity = Number(result._sum.quantity || 0);
    const reserved = Number(result._sum.reservedQty || 0);
    const held = await tx.stockHold.aggregate({ where: { status: 'HELD', lot: { itemId } }, _sum: { quantity: true } });
    const outside = await tx.stockMovement.aggregate({ where: { itemId, lot: { owner: { not: 'COMPANY' } } }, _sum: { quantity: true } });
    const quarantined = Number(held._sum.quantity || 0), customerOwned = Number(outside._sum.quantity || 0);
    return { quantity, reserved, quarantined, customerOwned, available: quantity - reserved - quarantined - customerOwned };
  }

  async listItems() {
    const items = await this.prisma.catalogueItem.findMany({ include: { brand: true, category: true }, orderBy: { name: 'asc' } });
    return Promise.all(items.map(async (item) => ({ ...item, stock: await this.stockSummary(this.prisma, item.id) })));
  }

  async createItem(body: any) {
    if (!body.name?.trim() || !body.sku?.trim() || !body.type) throw new BadRequestException('Name, SKU and item type are required');
    if (body.shopVisible && !['YARN', 'FINISHED_GOOD', 'SERVICE'].includes(body.type)) throw new BadRequestException('Only yarn, finished goods and services can be published in the shop');
    return this.prisma.catalogueItem.create({ data: {
      name: body.name.trim(), sku: body.sku.trim().toUpperCase(), type: body.type, description: body.description || null,
      uom: body.uom || 'KG', hsnSac: body.hsnSac || null, gstRate: Number(body.gstRate || 0), salePrice: Number(body.salePrice || 0),
      reorderLevel: Number(body.reorderLevel || 0), costPrice: Number(body.costPrice || 0), imageUrl: body.imageUrl || null, shopVisible: body.shopVisible === true, brandId: body.brandId ? Number(body.brandId) : null,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
    }});
  }

  async updateItem(id: number, body: any) {
    const existing = await this.prisma.catalogueItem.findUniqueOrThrow({ where: { id } });
    if ((body.type && body.type !== existing.type) || (body.uom && body.uom !== existing.uom) || (existing.legacySource && body.sku && body.sku !== existing.sku)) {
      if (existing.legacySource || await this.prisma.stockMovement.count({ where: { itemId: id } }))
        throw new BadRequestException('Stock items keep their original type, unit and inventory SKU. Create a new item for a different unit or material.');
    }
    const nextType = body.type ?? existing.type;
    const nextVisible = body.shopVisible ?? existing.shopVisible;
    if (nextVisible && !['YARN', 'FINISHED_GOOD', 'SERVICE'].includes(nextType)) throw new BadRequestException('Only yarn, finished goods and services can be published in the shop');
    const allowed = ['name', 'sku', 'type', 'description', 'uom', 'hsnSac', 'imageUrl', 'active', 'shopVisible'];
    const data: any = {};
    for (const key of allowed) if (body[key] !== undefined) data[key] = key === 'sku' ? String(body[key]).toUpperCase() : body[key];
    for (const key of ['gstRate', 'salePrice', 'costPrice', 'reorderLevel', 'brandId', 'categoryId']) if (body[key] !== undefined) data[key] = body[key] === '' || body[key] === null ? null : Number(body[key]);
    return this.prisma.catalogueItem.update({ where: { id }, data });
  }
  archiveItem(id: number) { return this.prisma.catalogueItem.update({ where: { id }, data: { active: false } }); }
  itemMovements(itemId: number) { return this.prisma.stockMovement.findMany({ where: { itemId }, orderBy: [{ date: 'desc' }, { id: 'desc' }] }); }

  listBrands() { return this.prisma.brand.findMany({ orderBy: { name: 'asc' } }); }
  createBrand(body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Brand name is required');
    return this.prisma.brand.create({ data: { name: body.name.trim() } });
  }
  updateBrand(id: number, body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Brand name is required');
    return this.prisma.brand.update({ where: { id }, data: { name: body.name.trim() } });
  }
  archiveBrand(id: number) { return this.prisma.brand.update({ where: { id }, data: { active: false } }); }
  listCategories() { return this.prisma.catalogueCategory.findMany({ orderBy: { name: 'asc' } }); }
  createCategory(body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Category name is required');
    return this.prisma.catalogueCategory.create({ data: { name: body.name.trim() } });
  }
  updateCategory(id: number, body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Category name is required');
    return this.prisma.catalogueCategory.update({ where: { id }, data: { name: body.name.trim() } });
  }
  archiveCategory(id: number) { return this.prisma.catalogueCategory.update({ where: { id }, data: { active: false } }); }

  async adjustStock(itemId: number, body: any) {
    body = { ...body, date: stockEventDate(body.date).toISOString() };
    const quantity = Number(body.quantity);
    if (!Number.isFinite(quantity) || quantity === 0) throw new BadRequestException('Adjustment quantity must be a non-zero number');
    await this.prisma.catalogueItem.findUniqueOrThrow({ where: { id: itemId } });
    return this.prisma.stockTransaction(async (tx) => {
      const stock = await this.stockSummary(tx, itemId);
      if (stock.available + quantity < -0.0001) throw new BadRequestException('Adjustment exceeds available stock');
      return tx.stockMovement.create({ data: { itemId, quantity, movementType: 'ADJUSTMENT', referenceType: 'MANUAL', notes: body.notes || null, createdBy: body.createdBy || null, date: body.date ? new Date(body.date) : new Date() } });
    });
  }

  async listCustomers() {
    const customers = await this.prisma.customer.findMany({ orderBy: { name: 'asc' } });
    return Promise.all(customers.map(async (customer) => {
      const totals = await this.prisma.customerLedgerEntry.aggregate({ where: { customerId: customer.id }, _sum: { debit: true, credit: true } });
      return { ...customer, balance: Number(totals._sum.debit || 0) - Number(totals._sum.credit || 0) };
    }));
  }

  createCustomer(body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Customer name is required');
    return this.prisma.customer.create({ data: { name: body.name.trim(), phone: body.phone || null, email: body.email || null, gstin: body.gstin || null, state: body.state || 'Tamil Nadu', address: body.address || null } });
  }
  updateCustomer(id: number, body: any) {
    const data: any = {}; for (const key of ['name', 'phone', 'email', 'gstin', 'state', 'address', 'active']) if (body[key] !== undefined) data[key] = body[key] || null;
    return this.prisma.customer.update({ where: { id }, data });
  }

  async customerLedger(customerId: number) {
    await this.prisma.customer.findUniqueOrThrow({ where: { id: customerId } });
    return this.prisma.customerLedgerEntry.findMany({ where: { customerId }, orderBy: [{ date: 'desc' }, { id: 'desc' }] });
  }

  async createOrder(body: any) {
    const lines = (body.lines || []) as OrderLineInput[];
    if (!body.customerId || lines.length === 0) throw new BadRequestException('Customer and at least one order line are required');
    if (new Set(lines.map(line => Number(line.itemId))).size !== lines.length) throw new BadRequestException('Combine duplicate items into one order line');
    return this.prisma.stockTransaction(async (tx) => {
      const items = await tx.catalogueItem.findMany({ where: { id: { in: lines.map(l => Number(l.itemId)) } } });
      const itemMap = new Map(items.map((item: any) => [item.id, item]));
      for (const line of lines) {
        if (!line.itemId || !Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0) throw new BadRequestException('Each order line needs an item and positive quantity');
        const item = itemMap.get(Number(line.itemId));
        if (!item || !item.active) throw new BadRequestException(`Catalogue item ${line.itemId} is unavailable`);
        if (!Number.isFinite(Number(line.rate ?? item.salePrice)) || Number(line.rate ?? item.salePrice) < 0 || !Number.isFinite(Number(line.discount || 0)) || Number(line.discount || 0) < 0 || Number(line.discount || 0) > Number(line.quantity) * Number(line.rate ?? item.salePrice)) throw new BadRequestException('Order rates and discounts must be valid non-negative amounts');
        if (item.type === 'SERVICE') continue;
        const stock = await this.stockSummary(tx, Number(line.itemId));
        if (stock.available + 0.0001 < Number(line.quantity)) throw new BadRequestException(`Insufficient available stock for item ${line.itemId}`);
      }
      const settings = await tx.systemSettings.findFirst();
      const customer = await tx.customer.findUnique({ where: { id: Number(body.customerId) } });
      if (!customer?.active) throw new BadRequestException('Choose an active customer');
      const { subtotal, discount, total } = calculateInvoiceTotals(lines.map(line => ({ quantity: Number(line.quantity), rate: Number(line.rate ?? itemMap.get(Number(line.itemId))?.salePrice ?? 0), gstRate: Number(line.gstRate ?? itemMap.get(Number(line.itemId))?.gstRate ?? 0), discount: Number(line.discount || 0) })), Number(body.discount || 0), settings?.sellerState || 'Tamil Nadu', customer.state || settings?.sellerState || 'Tamil Nadu');
      const order = await tx.salesOrder.create({ data: {
        orderNo: body.orderNo || `SO-${Date.now()}`, date: body.date ? new Date(body.date) : new Date(), customerId: Number(body.customerId),
        status: 'CONFIRMED', subtotal, discount, total, notes: body.notes || null, createdBy: body.createdBy || null,
        lines: { create: lines.map(line => ({ itemId: Number(line.itemId), quantity: Number(line.quantity), rate: Number(line.rate ?? itemMap.get(Number(line.itemId))?.salePrice ?? 0), gstRate: Number(line.gstRate ?? itemMap.get(Number(line.itemId))?.gstRate ?? 0), discount: Number(line.discount || 0) })) },
      }, include: { lines: true } });
      for (const line of lines) if (itemMap.get(Number(line.itemId))?.type !== 'SERVICE') await tx.stockMovement.create({ data: { itemId: Number(line.itemId), quantity: 0, reservedQty: Number(line.quantity), movementType: 'SALES_RESERVE', referenceType: 'SALES_ORDER', referenceId: String(order.id), createdBy: body.createdBy || null } });
      return order;
    });
  }

  async listOrders() { return this.prisma.salesOrder.findMany({ include: { customer: true, lines: { include: { item: true } }, invoices: true }, orderBy: { date: 'desc' } }); }

  async cancelOrder(id: number, body: any) {
    return this.prisma.stockTransaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({ where: { id }, include: { lines: true } });
      if (!order) throw new BadRequestException('Sales order not found');
      if (['CANCELLED', 'CANCELLED_PARTIAL'].includes(order.status)) return order;
      if (order.status === 'INVOICED') throw new BadRequestException('This order is fully invoiced. Reverse its invoices to return goods.');
      for (const line of order.lines) {
        const item = await tx.catalogueItem.findUnique({ where: { id: line.itemId } });
        const remainingReservation = await tx.stockMovement.aggregate({ where: { itemId: line.itemId, referenceType: 'SALES_ORDER', referenceId: String(id) }, _sum: { reservedQty: true } });
        if (item?.type !== 'SERVICE' && (remainingReservation._sum.reservedQty || 0) > 0.000001) await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: 0, reservedQty: -(remainingReservation._sum.reservedQty || 0), movementType: 'SALES_RELEASE', referenceType: 'SALES_ORDER', referenceId: String(id), notes: body.notes || 'Unfulfilled order quantity cancelled' } });
      }
      return tx.salesOrder.update({ where: { id }, data: { status: order.lines.some(line => line.invoicedQty > 0 || line.dispatchedQty > 0) ? 'CANCELLED_PARTIAL' : 'CANCELLED', notes: [order.notes, body.notes].filter(Boolean).join('\n') || null } });
    });
  }

  async createInwardReceipt(body: any) {
    body = { ...body, date: stockEventDate(body.date).toISOString() };
    const lines = body.lines || [];
    if (!body.supplierName?.trim() || !lines.length) throw new BadRequestException('Supplier and at least one receipt line are required');
    return this.prisma.stockTransaction(async (tx) => {
      let total = 0;
      for (const line of lines) { if (!line.itemId || !Number.isFinite(Number(line.quantity)) || !Number.isFinite(Number(line.unitCost)) || Number(line.quantity) <= 0 || Number(line.unitCost) < 0) throw new BadRequestException('Each receipt line needs an item, quantity and unit cost'); total += Number(line.quantity) * Number(line.unitCost); }
      const receipt = await tx.inwardReceipt.create({ data: { receiptNo: body.receiptNo || `GRN-${Date.now()}`, date: body.date ? new Date(body.date) : new Date(), supplierName: body.supplierName.trim(), referenceNumber: body.referenceNumber || null, notes: body.notes || null, total, createdBy: body.createdBy || null, lines: { create: lines.map((line: any) => ({ itemId: Number(line.itemId), quantity: Number(line.quantity), unitCost: Number(line.unitCost) })) } }, include: { lines: { include: { item: true } } } });
      for (const line of lines) await tx.stockMovement.create({ data: { itemId: Number(line.itemId), date: receipt.date, quantity: Number(line.quantity), movementType: 'INWARD', referenceType: 'INWARD_RECEIPT', referenceId: String(receipt.id), notes: `${receipt.receiptNo} · ${body.supplierName}` } });
      return receipt;
    });
  }
  listInwardReceipts() { return this.prisma.inwardReceipt.findMany({ include: { lines: { include: { item: true } } }, orderBy: { date: 'desc' } }); }

  async createCostingSheet(body: any) {
    const components = Array.isArray(body.components) ? body.components : [];
    if (!body.styleCode?.trim() || !components.length) throw new BadRequestException('Style code and at least one costing component are required');
    const total = components.reduce((sum: number, x: any) => sum + Number(x.quantity || x.qty || 0) * Number(x.rate || 0), 0);
    return this.prisma.costingSheet.create({ data: { styleCode: body.styleCode.trim().toUpperCase(), description: body.description || null, total, components: JSON.stringify(components), createdBy: body.createdBy || null } });
  }
  listCostingSheets() { return this.prisma.costingSheet.findMany({ orderBy: { updatedAt: 'desc' } }); }
  async updateCostingSheet(id: number, body: any) {
    const components = Array.isArray(body.components) ? body.components : undefined;
    const data: any = { ...(body.description !== undefined ? { description: body.description || null } : {}), ...(body.status ? { status: body.status } : {}) };
    if (components) { data.components = JSON.stringify(components); data.total = components.reduce((sum: number, x: any) => sum + Number(x.quantity || x.qty || 0) * Number(x.rate || 0), 0); }
    return this.prisma.costingSheet.update({ where: { id }, data });
  }

  async createInvoice(body: any) {
    if (body.currency && body.currency !== 'INR') throw new BadRequestException('The shared receivables ledger uses INR. Foreign-currency billing requires exchange-rate accounting.');
    let lines = (body.lines || []) as InvoiceLineInput[];
    if (!body.customerId || lines.length === 0) throw new BadRequestException('Customer and at least one invoice line are required');
    if (new Set(lines.map(line => Number(line.itemId))).size !== lines.length) throw new BadRequestException('Combine duplicate items into one invoice line');
    return this.prisma.stockTransaction(async (tx) => {
      const requestHash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
      if (body.requestKey) {
        const previous = await tx.invoice.findUnique({ where: { requestKey: String(body.requestKey) }, include: { items: true, customer: true } });
        if (previous) { if (previous.requestHash !== requestHash) throw new BadRequestException('This invoice request was used for different details'); return previous; }
      }
      const invoiceDate = stockEventDate(body.date);
      await assertOpenPeriod(tx, invoiceDate);
      const customer = await tx.customer.findUnique({ where: { id: Number(body.customerId) } });
      if (!customer) throw new BadRequestException('Customer not found');
      const fulfilment = body.fulfilmentId ? await tx.workflowDocument.findUnique({ where: { id: Number(body.fulfilmentId) }, include: { lines: true, fulfilmentInvoices: { where: { status: { not: 'VOID' } }, include: { items: true } } } }) : null;
      if (body.fulfilmentId && (!fulfilment || fulfilment.kind !== 'ORDER_DISPATCH' || fulfilment.status !== 'POSTED' || fulfilment.customerId !== customer.id)) throw new BadRequestException('Choose an active dispatch for this customer');
      if (fulfilment && body.outwardId) throw new BadRequestException('Choose one dispatch source');
      const orderId = fulfilment?.orderId || (body.salesOrderId ? Number(body.salesOrderId) : null);
      const salesOrder = orderId ? await tx.salesOrder.findUnique({ where: { id: orderId }, include: { lines: true, invoices: { where: { status: { not: 'VOID' } }, include: { items: true } } } }) : null;
      const outward = body.outwardId ? await tx.outward.findUnique({ where: { id: Number(body.outwardId) }, include: { items: true, invoices: { where: { status: { not: 'VOID' } }, include: { items: true } } } }) : null;
      if (body.outwardId && (!outward || outward.status !== 'DISPATCHED')) throw new BadRequestException('Choose an active dispatch to invoice');
      if (outward && salesOrder) throw new BadRequestException('Invoice an existing dispatch separately from a reserved sales order');
      if (outward && outward.customerName.trim().toLowerCase() !== customer.name.trim().toLowerCase()) throw new BadRequestException('Invoice customer must match the dispatch customer');
      if (orderId && (!salesOrder || (!fulfilment && !['CONFIRMED', 'PARTIALLY_INVOICED'].includes(salesOrder.status)))) throw new BadRequestException('Sales order is not available for invoicing');
      if (salesOrder && salesOrder.customerId !== customer.id) throw new BadRequestException('Invoice customer must match the sales order');
      if ([fulfilment?.date, outward?.date, salesOrder?.date].some(date => date && invoiceDate < date)) throw new BadRequestException('Invoice cannot precede its source order or dispatch');
      if (salesOrder) {
        lines = lines.map(line => {
          const contract = salesOrder.lines.find(l => l.itemId === Number(line.itemId));
          if (!contract) throw new BadRequestException('Invoice item is not on the order');
          if (line.rate !== undefined && Number(line.rate) !== contract.rate) throw new BadRequestException('Invoice rate must follow the agreed order contract');
          const priorDiscount = salesOrder.invoices.flatMap(i => i.items).filter(i => i.itemId === contract.itemId).reduce((s, i) => s + i.discount, 0);
          const final = Math.abs(contract.quantity - contract.invoicedQty - Number(line.quantity)) < 0.000001;
          return { ...line, rate: contract.rate, gstRate: contract.gstRate, discount: final ? money(contract.discount - priorDiscount) : money(contract.discount * Number(line.quantity) / contract.quantity) };
        });
        const final = salesOrder.lines.every(l => Math.abs(l.quantity - l.invoicedQty - Number(lines.find(x => Number(x.itemId) === l.itemId)?.quantity || 0)) < 0.000001);
        const usedDiscount = salesOrder.invoices.reduce((s, i) => s + i.discount, 0);
        body = { ...body, salesOrderId: salesOrder.id, discount: final ? money(salesOrder.discount - usedDiscount) : Math.min(money(salesOrder.discount - usedDiscount), money(salesOrder.discount * lines.reduce((s, l) => s + Number(l.quantity) * Number(l.rate) - Number(l.discount), 0) / (salesOrder.subtotal || 1))) };
      }
      const items = await tx.catalogueItem.findMany({ where: { id: { in: lines.map(l => Number(l.itemId)) } } });
      const itemMap = new Map(items.map((item: any) => [item.id, item]));
        const settings = await tx.systemSettings.findFirst();
        const sellerName = String(settings?.companyName || '').trim();
        const sellerAddress = String(settings?.address || '').trim();
        const sellerGSTIN = String(settings?.gstin || '').trim().toUpperCase();
        if (!sellerName || !sellerAddress || sellerGSTIN === '33XXXXX1234X1Z5' || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(sellerGSTIN)) {
          throw new BadRequestException('Configure the company legal name, address, and valid GSTIN in Settings before issuing invoices');
        }
        const sellerState = body.sellerState || settings?.sellerState || 'Tamil Nadu'; const buyerState = body.buyerState || customer.state || sellerState;
      for (const line of lines) {
        const item = itemMap.get(Number(line.itemId)); if (!item) throw new BadRequestException(`Catalogue item ${line.itemId} not found`);
        if (item.type !== 'SERVICE' && line.uom && line.uom !== item.uom) throw new BadRequestException('Invoice stock quantities must use the catalogue unit');
        if (!item.active && !salesOrder) throw new BadRequestException(`Catalogue item ${line.itemId} is archived`);
        if (!Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0) throw new BadRequestException('Invoice quantity must be positive');
        if (!Number.isFinite(Number(line.discount || 0)) || Number(line.discount || 0) < 0) throw new BadRequestException('Line discount must be non-negative');
        const stock = await this.stockSummary(tx, Number(line.itemId));
        const orderedReserved = body.salesOrderId ? Number(line.quantity) : 0;
        if (!outward && !fulfilment && item.type !== 'SERVICE' && stock.available + orderedReserved + 0.0001 < Number(line.quantity)) throw new BadRequestException(`Insufficient stock for ${item.name}`);
        if (fulfilment) {
          const delivered = fulfilment.lines.filter(l => l.itemId === item.id).reduce((s, l) => s + l.quantity, 0);
          const billed = fulfilment.fulfilmentInvoices.flatMap(i => i.items).filter(l => l.itemId === item.id).reduce((s, l) => s + Number(l.quantity || 0), 0);
          if (Number(line.quantity) > delivered - billed + 0.000001) throw new BadRequestException('Invoice exceeds the unbilled dispatch quantity');
        }
        if (outward) {
          if (item.type !== 'YARN' || item.uom !== 'KG' || item.legacySource !== 'EVERGREEN_LEGACY' || (line.uom && line.uom !== 'KG')) throw new BadRequestException('Dispatch billing uses the original yarn count in kilograms');
          const count = item.legacyId || item.sku.replace(/^LEGACY-YARN-/, '');
          const dispatched = outward.items.filter(row => row.count === count).reduce((sum, row) => sum + row.weight, 0);
          const billed = outward.invoices.flatMap(doc => doc.items).filter(row => row.itemId === item.id).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
          if (Number(line.quantity) > dispatched - billed + 0.0001) throw new BadRequestException(`Only ${(dispatched - billed).toFixed(2)} kg of ${item.name} remains unbilled on this dispatch`);
        }
        if (salesOrder) {
          const orderLine = salesOrder.lines.find(orderLine => orderLine.itemId === Number(line.itemId));
          if (!orderLine || orderLine.invoicedQty + Number(line.quantity) > orderLine.quantity + 0.0001) throw new BadRequestException(`Invoice quantity exceeds the remaining quantity for ${item.name}`);
          if (!fulfilment && orderLine.dispatchedQty > orderLine.invoicedQty) throw new BadRequestException('Invoice the existing order dispatch before making another direct delivery');
        }
      }
      const { subtotal, discount, cgst, sgst, igst, total } = calculateInvoiceTotals(lines.map(line => {
        const item = itemMap.get(Number(line.itemId));
        return { quantity: Number(line.quantity), rate: Number(line.rate ?? item.salePrice), discount: Number(line.discount || 0), gstRate: Number(line.gstRate ?? item.gstRate) };
      }), Number(body.discount || 0), sellerState, buyerState);
      const invoiceNo = body.invoiceNo || `INV-${Date.now()}`;
      const documentHash = createHash('sha256').update(JSON.stringify({ invoiceNo, customerId: body.customerId, date: body.date, total: total.toFixed(2), lines })).digest('hex');
      const invoice = await tx.invoice.create({ data: {
        invoiceNo, date: invoiceDate, dueDate: body.dueDate ? new Date(body.dueDate) : null,
          customerId: customer.id, customerName: customer.name, customerAddress: customer.address || '', customerGSTIN: customer.gstin || '', sellerName, sellerAddress, sellerGSTIN, sellerState, buyerState,
        subtotal, cgst, sgst, igst, total, discount, currency: body.currency || 'INR', documentHash, verificationKey: randomUUID(), requestKey: body.requestKey ? String(body.requestKey) : null, requestHash, fulfilmentId: fulfilment?.id || null,
        transportMode: body.transportMode || null, vehicleNo: body.vehicleNo || null, theme: body.theme || 'CLASSIC', issuerSignature: body.issuerSignature || null,
        notes: body.notes || null, terms: body.terms || null, salesOrderId: body.salesOrderId ? Number(body.salesOrderId) : null, outwardId: outward?.id || null, createdBy: body.createdBy || null,
        items: { create: lines.map(line => { const item = itemMap.get(Number(line.itemId)); return { itemId: item.id, yarnCount: item.type === 'YARN' ? item.name : '', bags: 0, weight: item.uom === 'KG' ? Number(line.quantity) : 0, rate: Number(line.rate ?? item.salePrice), description: line.description || item.name, hsnSac: line.hsnSac || item.hsnSac, uom: line.uom || item.uom, quantity: Number(line.quantity), gstRate: Number(line.gstRate ?? item.gstRate), discount: Number(line.discount || 0) }; }) },
      }, include: { items: true, customer: true } });
      if (!outward && !fulfilment) for (const line of lines) { const item = itemMap.get(Number(line.itemId)); if (item.type !== 'SERVICE') await tx.stockMovement.create({ data: { itemId: item.id, date: stockEventDate(body.stockDate || invoiceDate.toISOString()), quantity: -Number(line.quantity), reservedQty: body.salesOrderId ? -Number(line.quantity) : 0, movementType: 'INVOICE_OUT', referenceType: 'INVOICE', referenceId: String(invoice.id), createdBy: body.createdBy || null } }); }
      await tx.customerLedgerEntry.create({ data: { customerId: customer.id, date: invoice.date, type: 'INVOICE', debit: total, reference: invoice.invoiceNo } });
      if (salesOrder) {
        for (const line of lines) {
          const orderLine = salesOrder.lines.find(entry => entry.itemId === Number(line.itemId));
          if (orderLine) await tx.salesOrderLine.update({ where: { id: orderLine.id }, data: { invoicedQty: { increment: Number(line.quantity) }, ...(!fulfilment ? { dispatchedQty: { increment: Number(line.quantity) } } : {}) } });
        }
        const refreshed = await tx.salesOrderLine.findMany({ where: { orderId: salesOrder.id } });
        const complete = refreshed.every(line => line.invoicedQty >= line.quantity - 0.0001);
        const closed = ['CANCELLED', 'CANCELLED_PARTIAL'].includes(salesOrder.status);
        await tx.salesOrder.update({ where: { id: salesOrder.id }, data: { status: complete ? 'INVOICED' : closed ? 'CANCELLED_PARTIAL' : salesOrder.status === 'ON_HOLD' ? 'ON_HOLD' : 'PARTIALLY_INVOICED' } });
      }
      return invoice;
    });
  }

  async listInvoices() { return this.prisma.invoice.findMany({ where: { customerId: { not: null } }, include: { items: { include: { item: true } }, customer: true, payments: true, outward: true, fulfilment: true }, orderBy: { date: 'desc' } }); }

  async recordInvoicePayment(invoiceId: number, body: any) {
    const amount = Number(body.amount); if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Payment amount must be a finite positive number');
    if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) throw new BadRequestException('Payment amounts use at most two decimal places');
    if (body.date && !Number.isFinite(new Date(body.date).getTime())) throw new BadRequestException('Enter a valid payment date');
    if (body.method && !['CASH', 'BANK', 'UPI', 'CHEQUE'].includes(body.method)) throw new BadRequestException('Choose a valid receipt method');
    const requestReference = body.idempotencyKey ? `PAYMENT-REQUEST:${String(body.idempotencyKey)}` : null;
    return this.prisma.stockTransaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice?.customerId) throw new BadRequestException('Unified invoice not found');
      if (requestReference) {
        const receipt = await tx.payment.findFirst({ where: { invoiceId, reference: requestReference } });
        if (receipt) {
          if (Math.abs(receipt.amount - amount) > 0.000001) throw new BadRequestException('This receipt request was already used for a different amount');
          return invoice;
        }
      }
      if (invoice.status === 'VOID') throw new BadRequestException('Voided invoices cannot receive payments');
      const paymentDate = stockEventDate(body.date);
      await assertOpenPeriod(tx, paymentDate);
      if (paymentDate < invoice.date) throw new BadRequestException('A pre-invoice receipt is a customer advance; allocate it to the invoice later');
      if (amount > invoice.total - invoice.creditTotal - invoice.amountPaid + 0.000001) throw new BadRequestException('Payment exceeds balance. Record an advance for excess/unallocated receipts.');
      const amountPaid = Math.round((invoice.amountPaid + amount) * 100) / 100;
      const updated = await tx.invoice.update({ where: { id: invoiceId }, data: { amountPaid, status: amountPaid >= invoice.total - invoice.creditTotal - 0.000001 ? 'PAID' : 'PARTIAL', payments: { create: { amount, date: paymentDate, method: body.method || 'CASH', reference: requestReference || body.reference || null, notes: [body.notes, requestReference ? body.reference : null].filter(Boolean).join('\n') || null, createdBy: body.createdBy || null } } } });
      await tx.customerLedgerEntry.create({ data: { customerId: invoice.customerId, date: paymentDate, type: 'PAYMENT', credit: amount, reference: invoice.invoiceNo, notes: body.reference || null } });
      return updated;
    });
  }

  async reverseInvoicePayment(invoiceId: number, paymentId: number, body: any) {
    if (!body.notes?.trim()) throw new BadRequestException('Enter a reason for reversing this payment');
    return this.prisma.stockTransaction(async tx => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
      if (!invoice?.customerId || invoice.status === 'VOID') throw new BadRequestException('Choose an active unified invoice');
      const payment = invoice.payments.find(row => row.id === paymentId);
      if (!payment || payment.amount <= 0 || ['REVERSAL', 'ALLOCATION'].includes(payment.method)) throw new BadRequestException('Choose an original cash/bank receipt to reverse');
      if (invoice.creditTotal > 0) throw new BadRequestException('After a return credit, use its available credit refund/allocation to preserve the settlement trail');
      const reference = `PAYMENT-REVERSAL:${paymentId}`;
      if (invoice.payments.some(row => row.method === 'REVERSAL' && row.reference === reference)) return invoice;
      const amountPaid = Math.max(0, Math.round((invoice.amountPaid - payment.amount) * 100) / 100);
      await tx.payment.create({ data: { invoiceId, date: new Date(), amount: -payment.amount, method: 'REVERSAL', reference, notes: body.notes.trim(), createdBy: body.createdBy || null } });
      await tx.customerLedgerEntry.create({ data: { customerId: invoice.customerId, type: 'PAYMENT_REVERSAL', debit: payment.amount, reference: invoice.invoiceNo, notes: `${reference} · ${body.notes.trim()}` } });
      return tx.invoice.update({ where: { id: invoiceId }, data: { amountPaid, status: amountPaid <= 0.000001 ? 'UNPAID' : amountPaid >= invoice.total - 0.000001 ? 'PAID' : 'PARTIAL' } });
    });
  }

  async voidInvoice(invoiceId: number, body: any) {
    return this.prisma.stockTransaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
      if (!invoice?.customerId) throw new BadRequestException('Unified invoice not found');
      if (invoice.status === 'VOID') return invoice;
      if (invoice.creditTotal > 0) throw new BadRequestException('This invoice has partial return credits. Complete its remaining return rather than voiding it twice.');
      if (invoice.amountPaid > 0.001) throw new BadRequestException('Refund or reverse recorded payments before voiding this invoice');
      const order = invoice.salesOrderId ? await tx.salesOrder.findUnique({ where: { id: invoice.salesOrderId } }) : null;
      const orderClosed = order && ['CANCELLED', 'CANCELLED_PARTIAL'].includes(order.status);
      for (const line of invoice.items) if (line.itemId && !invoice.outwardId && !invoice.fulfilmentId) {
        const item = await tx.catalogueItem.findUnique({ where: { id: line.itemId } });
        const issued = await tx.stockMovement.findMany({ where: { itemId: line.itemId, referenceType: 'INVOICE', referenceId: String(invoice.id), movementType: 'INVOICE_OUT' }, include: { valuation: true } });
        const issuedQty = -issued.reduce((s, i) => s + i.quantity, 0), issuedCost = -issued.reduce((s, i) => s + (i.valuation?.value || 0), 0);
        const unitCost = issued.length && issued.every(i => i.valuation?.status === 'VALUED') && issuedQty ? issuedCost / issuedQty : null;
        if (item?.type !== 'SERVICE') await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: Number(line.quantity || 0), unitCost, reservedQty: invoice.salesOrderId && !orderClosed ? Number(line.quantity || 0) : 0, movementType: 'INVOICE_REVERSAL', referenceType: 'INVOICE', referenceId: String(invoice.id), notes: body.notes || 'Invoice voided' } });
      }
      await tx.customerLedgerEntry.create({ data: { customerId: invoice.customerId, type: 'CREDIT_NOTE', credit: invoice.total, reference: invoice.invoiceNo, notes: body.notes || 'Invoice voided' } });
      if (invoice.salesOrderId) {
        const orderLines = await tx.salesOrderLine.findMany({ where: { orderId: invoice.salesOrderId } });
        for (const line of invoice.items) { const orderLine = orderLines.find(entry => entry.itemId === line.itemId); if (orderLine) await tx.salesOrderLine.update({ where: { id: orderLine.id }, data: { invoicedQty: { decrement: Number(line.quantity || 0) }, ...(!invoice.fulfilmentId ? { dispatchedQty: { decrement: Number(line.quantity || 0) } } : {}) } }); }
        const remaining = await tx.salesOrderLine.findMany({ where: { orderId: invoice.salesOrderId } });
        await tx.salesOrder.update({ where: { id: invoice.salesOrderId }, data: { status: orderClosed ? (remaining.some(line => line.invoicedQty > 0) ? 'CANCELLED_PARTIAL' : 'CANCELLED') : remaining.some(line => line.invoicedQty > 0) ? 'PARTIALLY_INVOICED' : 'CONFIRMED' } });
      }
      return tx.invoice.update({ where: { id: invoiceId }, data: { status: 'VOID', notes: [invoice.notes, body.notes].filter(Boolean).join('\n') || null } });
    });
  }
  async verifyInvoice(key: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { verificationKey: key }, include: { customer: true, items: true } });
    if (!invoice) throw new BadRequestException('Invoice verification record not found');
    return { valid: invoice.status !== 'VOID', invoiceNo: invoice.invoiceNo, date: invoice.date, total: invoice.total, currency: invoice.currency, customer: invoice.customer?.name || invoice.customerName, fingerprint: invoice.documentHash };
  }

  async report() {
    const [items, orders, invoices, jobs, ledger] = await Promise.all([this.listItems(), this.prisma.salesOrder.count({ where: { status: { in: ['CONFIRMED', 'PARTIALLY_INVOICED'] } } }), this.prisma.invoice.aggregate({ where: { customerId: { not: null }, status: { not: 'VOID' } }, _sum: { total: true, amountPaid: true, creditTotal: true } }), this.prisma.jobWorkChallan.count({ where: { status: { in: ['DISPATCHED', 'PART_RECEIVED'] } } }), this.prisma.customerLedgerEntry.aggregate({ _sum: { debit: true, credit: true } })]);
    return { lowStock: items.filter((item: any) => item.active && item.type !== 'SERVICE' && item.stock.available <= item.reorderLevel), openOrders: orders, invoicedValue: Number(invoices._sum.total || 0) - Number(invoices._sum.creditTotal || 0), receivables: Number(ledger._sum.debit || 0) - Number(ledger._sum.credit || 0), openJobWork: jobs };
  }
}
