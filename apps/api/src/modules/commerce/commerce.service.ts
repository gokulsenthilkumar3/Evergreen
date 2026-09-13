import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../services/prisma.service';

type OrderLineInput = { itemId: number; quantity: number; rate?: number; gstRate?: number; discount?: number };
type InvoiceLineInput = OrderLineInput & { description?: string; hsnSac?: string; uom?: string };

@Injectable()
export class CommerceService {
  constructor(private prisma: PrismaService) {}

  private async stockSummary(tx: any, itemId: number) {
    const result = await tx.stockMovement.aggregate({ where: { itemId }, _sum: { quantity: true, reservedQty: true } });
    const quantity = Number(result._sum.quantity || 0);
    const reserved = Number(result._sum.reservedQty || 0);
    return { quantity, reserved, available: quantity - reserved };
  }

  async listItems() {
    const items = await this.prisma.catalogueItem.findMany({ include: { brand: true, category: true }, orderBy: { name: 'asc' } });
    return Promise.all(items.map(async (item) => ({ ...item, stock: await this.stockSummary(this.prisma, item.id) })));
  }

  async createItem(body: any) {
    if (!body.name?.trim() || !body.sku?.trim() || !body.type) throw new BadRequestException('Name, SKU and item type are required');
    return this.prisma.catalogueItem.create({ data: {
      name: body.name.trim(), sku: body.sku.trim().toUpperCase(), type: body.type, description: body.description || null,
      uom: body.uom || 'KG', hsnSac: body.hsnSac || null, gstRate: Number(body.gstRate || 0), salePrice: Number(body.salePrice || 0),
      reorderLevel: Number(body.reorderLevel || 0), costPrice: Number(body.costPrice || 0), imageUrl: body.imageUrl || null, brandId: body.brandId ? Number(body.brandId) : null,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
    }});
  }

  async updateItem(id: number, body: any) {
    await this.prisma.catalogueItem.findUniqueOrThrow({ where: { id } });
    const allowed = ['name', 'sku', 'type', 'description', 'uom', 'hsnSac', 'imageUrl', 'active'];
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
  listCategories() { return this.prisma.catalogueCategory.findMany({ orderBy: { name: 'asc' } }); }
  createCategory(body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Category name is required');
    return this.prisma.catalogueCategory.create({ data: { name: body.name.trim() } });
  }

  async adjustStock(itemId: number, body: any) {
    const quantity = Number(body.quantity);
    if (!quantity) throw new BadRequestException('Adjustment quantity cannot be zero');
    await this.prisma.catalogueItem.findUniqueOrThrow({ where: { id: itemId } });
    return this.prisma.stockMovement.create({ data: { itemId, quantity, movementType: 'ADJUSTMENT', referenceType: 'MANUAL', notes: body.notes || null, createdBy: body.createdBy || null, date: body.date ? new Date(body.date) : new Date() } });
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
    return this.prisma.$transaction(async (tx) => {
      for (const line of lines) {
        if (!line.itemId || Number(line.quantity) <= 0) throw new BadRequestException('Each order line needs an item and positive quantity');
        const stock = await this.stockSummary(tx, Number(line.itemId));
        if (stock.available + 0.0001 < Number(line.quantity)) throw new BadRequestException(`Insufficient available stock for item ${line.itemId}`);
      }
      const items = await tx.catalogueItem.findMany({ where: { id: { in: lines.map(l => Number(l.itemId)) } } });
      const itemMap = new Map(items.map((item: any) => [item.id, item]));
      const subtotal = lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.rate ?? itemMap.get(Number(line.itemId))?.salePrice ?? 0), 0);
      const discount = Number(body.discount || 0);
      const order = await tx.salesOrder.create({ data: {
        orderNo: body.orderNo || `SO-${Date.now()}`, date: body.date ? new Date(body.date) : new Date(), customerId: Number(body.customerId),
        status: 'CONFIRMED', subtotal, discount, total: Math.max(0, subtotal - discount), notes: body.notes || null, createdBy: body.createdBy || null,
        lines: { create: lines.map(line => ({ itemId: Number(line.itemId), quantity: Number(line.quantity), rate: Number(line.rate ?? itemMap.get(Number(line.itemId))?.salePrice ?? 0), gstRate: Number(line.gstRate ?? itemMap.get(Number(line.itemId))?.gstRate ?? 0), discount: Number(line.discount || 0) })) },
      }, include: { lines: true } });
      for (const line of lines) await tx.stockMovement.create({ data: { itemId: Number(line.itemId), quantity: 0, reservedQty: Number(line.quantity), movementType: 'SALES_RESERVE', referenceType: 'SALES_ORDER', referenceId: String(order.id), createdBy: body.createdBy || null } });
      return order;
    });
  }

  async listOrders() { return this.prisma.salesOrder.findMany({ include: { customer: true, lines: { include: { item: true } }, invoices: true }, orderBy: { date: 'desc' } }); }

  async cancelOrder(id: number, body: any) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({ where: { id }, include: { lines: true } });
      if (!order) throw new BadRequestException('Sales order not found');
      if (order.status === 'CANCELLED') return order;
      if (order.lines.some(line => line.invoicedQty > 0)) throw new BadRequestException('Partially invoiced orders cannot be cancelled; issue a credit/reversal instead');
      for (const line of order.lines) await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: 0, reservedQty: -line.quantity, movementType: 'SALES_RELEASE', referenceType: 'SALES_ORDER', referenceId: String(id), notes: body.notes || 'Order cancelled' } });
      return tx.salesOrder.update({ where: { id }, data: { status: 'CANCELLED', notes: [order.notes, body.notes].filter(Boolean).join('\n') || null } });
    });
  }

  async createInwardReceipt(body: any) {
    const lines = body.lines || [];
    if (!body.supplierName?.trim() || !lines.length) throw new BadRequestException('Supplier and at least one receipt line are required');
    return this.prisma.$transaction(async (tx) => {
      let total = 0;
      for (const line of lines) { if (!line.itemId || Number(line.quantity) <= 0 || Number(line.unitCost) < 0) throw new BadRequestException('Each receipt line needs an item, quantity and unit cost'); total += Number(line.quantity) * Number(line.unitCost); }
      const receipt = await tx.inwardReceipt.create({ data: { receiptNo: body.receiptNo || `GRN-${Date.now()}`, date: body.date ? new Date(body.date) : new Date(), supplierName: body.supplierName.trim(), referenceNumber: body.referenceNumber || null, notes: body.notes || null, total, createdBy: body.createdBy || null, lines: { create: lines.map((line: any) => ({ itemId: Number(line.itemId), quantity: Number(line.quantity), unitCost: Number(line.unitCost) })) } }, include: { lines: { include: { item: true } } } });
      for (const line of lines) await tx.stockMovement.create({ data: { itemId: Number(line.itemId), quantity: Number(line.quantity), movementType: 'INWARD', referenceType: 'INWARD_RECEIPT', referenceId: String(receipt.id), notes: `${receipt.receiptNo} · ${body.supplierName}` } });
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
    const lines = (body.lines || []) as InvoiceLineInput[];
    if (!body.customerId || lines.length === 0) throw new BadRequestException('Customer and at least one invoice line are required');
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: Number(body.customerId) } });
      if (!customer) throw new BadRequestException('Customer not found');
      const salesOrder = body.salesOrderId ? await tx.salesOrder.findUnique({ where: { id: Number(body.salesOrderId) }, include: { lines: true } }) : null;
      if (body.salesOrderId && !salesOrder) throw new BadRequestException('Sales order not found');
      const items = await tx.catalogueItem.findMany({ where: { id: { in: lines.map(l => Number(l.itemId)) } } });
      const itemMap = new Map(items.map((item: any) => [item.id, item]));
      let subtotal = 0, cgst = 0, sgst = 0, igst = 0;
      const sellerState = body.sellerState || 'Tamil Nadu'; const buyerState = body.buyerState || customer.state || sellerState;
      for (const line of lines) {
        const item = itemMap.get(Number(line.itemId)); if (!item) throw new BadRequestException(`Catalogue item ${line.itemId} not found`);
        const stock = await this.stockSummary(tx, Number(line.itemId));
        const orderedReserved = body.salesOrderId ? Number(line.quantity) : 0;
        if (item.type !== 'SERVICE' && stock.available + orderedReserved + 0.0001 < Number(line.quantity)) throw new BadRequestException(`Insufficient stock for ${item.name}`);
        if (salesOrder) {
          const orderLine = salesOrder.lines.find(orderLine => orderLine.itemId === Number(line.itemId));
          if (!orderLine || orderLine.invoicedQty + Number(line.quantity) > orderLine.quantity + 0.0001) throw new BadRequestException(`Invoice quantity exceeds the remaining quantity for ${item.name}`);
        }
        const taxable = Number(line.quantity) * Number(line.rate ?? item.salePrice) - Number(line.discount || 0);
        const tax = taxable * Number(line.gstRate ?? item.gstRate) / 100; subtotal += taxable;
        if (sellerState === buyerState) { cgst += tax / 2; sgst += tax / 2; } else igst += tax;
      }
      const total = subtotal + cgst + sgst + igst - Number(body.discount || 0);
      const invoiceNo = body.invoiceNo || `INV-${Date.now()}`;
      const documentHash = createHash('sha256').update(JSON.stringify({ invoiceNo, customerId: body.customerId, date: body.date, total: total.toFixed(2), lines })).digest('hex');
      const invoice = await tx.invoice.create({ data: {
        invoiceNo, date: body.date ? new Date(body.date) : new Date(), dueDate: body.dueDate ? new Date(body.dueDate) : null,
        customerId: customer.id, customerName: customer.name, customerAddress: customer.address || '', customerGSTIN: customer.gstin || '', sellerState, buyerState,
        subtotal, cgst, sgst, igst, total, discount: Number(body.discount || 0), currency: body.currency || 'INR', documentHash, verificationKey: randomUUID(),
        transportMode: body.transportMode || null, vehicleNo: body.vehicleNo || null, theme: body.theme || 'CLASSIC', issuerSignature: body.issuerSignature || null,
        notes: body.notes || null, terms: body.terms || null, salesOrderId: body.salesOrderId ? Number(body.salesOrderId) : null, createdBy: body.createdBy || null,
        items: { create: lines.map(line => { const item = itemMap.get(Number(line.itemId)); return { itemId: item.id, yarnCount: item.type === 'YARN' ? item.name : '', bags: 0, weight: item.uom === 'KG' ? Number(line.quantity) : 0, rate: Number(line.rate ?? item.salePrice), description: line.description || item.name, hsnSac: line.hsnSac || item.hsnSac, uom: line.uom || item.uom, quantity: Number(line.quantity), gstRate: Number(line.gstRate ?? item.gstRate), discount: Number(line.discount || 0) }; }) },
      }, include: { items: true, customer: true } });
      for (const line of lines) { const item = itemMap.get(Number(line.itemId)); if (item.type !== 'SERVICE') await tx.stockMovement.create({ data: { itemId: item.id, quantity: -Number(line.quantity), reservedQty: body.salesOrderId ? -Number(line.quantity) : 0, movementType: 'INVOICE_OUT', referenceType: 'INVOICE', referenceId: String(invoice.id), createdBy: body.createdBy || null } }); }
      await tx.customerLedgerEntry.create({ data: { customerId: customer.id, date: invoice.date, type: 'INVOICE', debit: total, reference: invoice.invoiceNo } });
      if (salesOrder) {
        for (const line of lines) {
          const orderLine = salesOrder.lines.find(entry => entry.itemId === Number(line.itemId));
          if (orderLine) await tx.salesOrderLine.update({ where: { id: orderLine.id }, data: { invoicedQty: { increment: Number(line.quantity) } } });
        }
        const refreshed = await tx.salesOrderLine.findMany({ where: { orderId: salesOrder.id } });
        const complete = refreshed.every(line => line.invoicedQty >= line.quantity - 0.0001);
        await tx.salesOrder.update({ where: { id: salesOrder.id }, data: { status: complete ? 'INVOICED' : 'PARTIALLY_INVOICED' } });
      }
      return invoice;
    });
  }

  async listInvoices() { return this.prisma.invoice.findMany({ where: { customerId: { not: null } }, include: { items: { include: { item: true } }, customer: true, payments: true }, orderBy: { date: 'desc' } }); }

  async recordInvoicePayment(invoiceId: number, body: any) {
    const amount = Number(body.amount); if (!amount || amount <= 0) throw new BadRequestException('Payment amount must be positive');
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice?.customerId) throw new BadRequestException('Unified invoice not found');
      if (amount > invoice.total - invoice.amountPaid + 0.01) throw new BadRequestException('Payment exceeds balance');
      const amountPaid = invoice.amountPaid + amount;
      const updated = await tx.invoice.update({ where: { id: invoiceId }, data: { amountPaid, status: amountPaid >= invoice.total - 0.01 ? 'PAID' : 'PARTIAL', payments: { create: { amount, date: body.date ? new Date(body.date) : new Date(), method: body.method || 'CASH', reference: body.reference || null, notes: body.notes || null, createdBy: body.createdBy || null } } } });
      await tx.customerLedgerEntry.create({ data: { customerId: invoice.customerId, type: 'PAYMENT', credit: amount, reference: invoice.invoiceNo, notes: body.reference || null } });
      return updated;
    });
  }

  async voidInvoice(invoiceId: number, body: any) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
      if (!invoice?.customerId) throw new BadRequestException('Unified invoice not found');
      if (invoice.status === 'VOID') return invoice;
      if (invoice.amountPaid > 0.001) throw new BadRequestException('Refund or reverse recorded payments before voiding this invoice');
      for (const line of invoice.items) if (line.itemId) await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: Number(line.quantity || 0), movementType: 'INVOICE_REVERSAL', referenceType: 'INVOICE', referenceId: String(invoice.id), notes: body.notes || 'Invoice voided' } });
      await tx.customerLedgerEntry.create({ data: { customerId: invoice.customerId, type: 'CREDIT_NOTE', credit: invoice.total, reference: invoice.invoiceNo, notes: body.notes || 'Invoice voided' } });
      if (invoice.salesOrderId) {
        const orderLines = await tx.salesOrderLine.findMany({ where: { orderId: invoice.salesOrderId } });
        for (const line of invoice.items) { const orderLine = orderLines.find(entry => entry.itemId === line.itemId); if (orderLine) await tx.salesOrderLine.update({ where: { id: orderLine.id }, data: { invoicedQty: { decrement: Number(line.quantity || 0) } } }); }
        await tx.salesOrder.update({ where: { id: invoice.salesOrderId }, data: { status: 'CONFIRMED' } });
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
    const [items, orders, invoices, jobs] = await Promise.all([this.listItems(), this.prisma.salesOrder.count({ where: { status: { in: ['CONFIRMED', 'PARTIALLY_INVOICED'] } } }), this.prisma.invoice.aggregate({ where: { customerId: { not: null } }, _sum: { total: true, amountPaid: true } }), this.prisma.jobWorkChallan.count({ where: { status: { not: 'COMPLETED' } } })]);
    return { lowStock: items.filter((item: any) => item.stock.available <= item.reorderLevel), openOrders: orders, invoicedValue: Number(invoices._sum.total || 0), receivables: Number(invoices._sum.total || 0) - Number(invoices._sum.amountPaid || 0), openJobWork: jobs };
  }
}
