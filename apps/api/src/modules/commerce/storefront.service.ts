import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../services/prisma.service';
import { calculateInvoiceTotals } from './invoice-totals';

const publicTypes = ['YARN', 'FINISHED_GOOD', 'SERVICE'];
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max + 1) : '';

@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  async products() {
    const items = await this.prisma.catalogueItem.findMany({
      where: { active: true, shopVisible: true, type: { in: publicTypes } },
      include: { brand: true, category: true },
      orderBy: { name: 'asc' },
    });
    return Promise.all(items.map(async item => {
      const stock = item.type === 'SERVICE' ? null : await this.prisma.stockMovement.aggregate({ where: { itemId: item.id }, _sum: { quantity: true, reservedQty: true } });
      const available = item.type === 'SERVICE' ? null : Math.max(0, roundMoney(Number(stock?._sum.quantity || 0) - Number(stock?._sum.reservedQty || 0)));
      return {
        id: item.id, sku: item.sku, name: item.name, description: item.description,
        type: item.type, uom: item.uom, gstRate: item.gstRate, salePrice: item.salePrice,
        brand: item.brand?.active ? item.brand.name : null,
        category: item.category?.active ? item.category.name : null,
        available,
        // External URLs and data URLs are never exposed to public browsers.
        imageUrl: item.imageUrl?.startsWith('/api/backend/media/') ? item.imageUrl : null,
      };
    }));
  }

  async placeOrder(body: any) {
    const name = clean(body?.name, 120);
    const phone = clean(body?.phone, 25);
    const email = clean(body?.email, 160);
    const address = clean(body?.address, 500);
    const state = clean(body?.state, 80);
    const gstin = clean(body?.gstin, 15).toUpperCase();
    const notes = clean(body?.notes, 500);
    const lines = body?.lines;
    if (body?.website) throw new BadRequestException('Order could not be submitted');
    if (name.length < 2 || name.length > 120) throw new BadRequestException('Enter a valid customer name');
    if (!/^\+?[0-9\s()-]{7,25}$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) throw new BadRequestException('Enter a valid phone number');
    if (email && (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new BadRequestException('Enter a valid email address');
    if (address.length < 8 || address.length > 500 || state.length < 2 || state.length > 80) throw new BadRequestException('Enter a delivery address and state');
    if (gstin && !/^[0-9]{2}[A-Z0-9]{10}[0-9A-Z]{3}$/.test(gstin)) throw new BadRequestException('Enter a valid GSTIN');
    if (notes.length > 500) throw new BadRequestException('Order notes are too long');
    if (!Array.isArray(lines) || lines.length < 1 || lines.length > 20) throw new BadRequestException('Choose between 1 and 20 products');
    const parsedLines = lines.map((line: any) => ({ itemId: Number(line?.itemId), quantity: Number(line?.quantity) }));
    if (parsedLines.some((line: any) => !Number.isSafeInteger(line.itemId) || line.itemId <= 0 || !Number.isFinite(line.quantity) || line.quantity <= 0 || line.quantity > 100000 || Math.abs(Math.round(line.quantity * 1000) - line.quantity * 1000) > 0.000001)) throw new BadRequestException('Order quantities are invalid');
    if (new Set(parsedLines.map((line: any) => line.itemId)).size !== parsedLines.length) throw new BadRequestException('Combine duplicate products');

    return this.prisma.$transaction(async tx => {
      const items = await tx.catalogueItem.findMany({ where: { id: { in: parsedLines.map((line: any) => line.itemId) } } });
      const itemMap = new Map(items.map(item => [item.id, item]));
      for (const line of parsedLines) {
        const item = itemMap.get(line.itemId);
        if (!item || !item.active || !item.shopVisible || !publicTypes.includes(item.type)) throw new BadRequestException('A selected product is no longer available');
        if (item.type === 'SERVICE') continue;
        const stock = await tx.stockMovement.aggregate({ where: { itemId: item.id }, _sum: { quantity: true, reservedQty: true } });
        const available = Number(stock._sum.quantity || 0) - Number(stock._sum.reservedQty || 0);
        if (available + 0.0001 < line.quantity) throw new BadRequestException(`${item.name} has insufficient stock`);
      }
      const taxLines = parsedLines.map((line: any) => {
        const item = itemMap.get(line.itemId)!;
        return { quantity: line.quantity, rate: item.salePrice, discount: 0, gstRate: item.gstRate };
      });
      const estimate = calculateInvoiceTotals(taxLines, 0, 'Tamil Nadu', state);
      const customer = await tx.customer.create({ data: { name, phone, email: email || null, address, state, gstin: gstin || null } });
      const order = await tx.salesOrder.create({
        data: {
          orderNo: `WEB-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
          customerId: customer.id, status: 'CONFIRMED', subtotal: estimate.subtotal,
          total: estimate.subtotal, notes: notes || null, createdBy: 'STOREFRONT',
          lines: { create: parsedLines.map((line: any) => {
            const item = itemMap.get(line.itemId)!;
            return { itemId: item.id, quantity: line.quantity, rate: item.salePrice, gstRate: item.gstRate, discount: 0 };
          }) },
        },
      });
      for (const line of parsedLines) {
        const item = itemMap.get(line.itemId)!;
        if (item.type !== 'SERVICE') await tx.stockMovement.create({ data: { itemId: item.id, quantity: 0, reservedQty: line.quantity, movementType: 'SALES_RESERVE', referenceType: 'SALES_ORDER', referenceId: String(order.id), createdBy: 'STOREFRONT' } });
      }
      return { orderNo: order.orderNo, subtotal: estimate.subtotal, estimatedTax: roundMoney(estimate.cgst + estimate.sgst + estimate.igst), estimatedTotal: estimate.total, status: order.status };
    });
  }
}
