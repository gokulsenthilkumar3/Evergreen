import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class JobWorkService {
  constructor(private prisma: PrismaService) {}

  private async available(tx: any, itemId: number) {
    const result = await tx.stockMovement.aggregate({ where: { itemId }, _sum: { quantity: true, reservedQty: true } });
    return Number(result._sum.quantity || 0) - Number(result._sum.reservedQty || 0);
  }

  listWorkers() { return this.prisma.jobWorker.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }

  createWorker(body: any) {
    if (!body.name?.trim()) throw new BadRequestException('Job worker name is required');
    return this.prisma.jobWorker.create({ data: { name: body.name.trim(), phone: body.phone || null, address: body.address || null, gstin: body.gstin || null } });
  }

  listChallans() {
    return this.prisma.jobWorkChallan.findMany({ include: { jobWorker: true, dispatchLines: { include: { item: true } }, receiptLines: { include: { item: true } } }, orderBy: { date: 'desc' } });
  }

  async dispatch(body: any) {
    const lines = body.lines || [];
    if (!body.jobWorkerId || !body.processType?.trim() || lines.length === 0) throw new BadRequestException('Job worker, process and at least one material line are required');
    return this.prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const quantity = Number(line.quantity);
        if (!line.itemId || quantity <= 0) throw new BadRequestException('Every dispatch line needs an item and positive quantity');
        if (await this.available(tx, Number(line.itemId)) + 0.0001 < quantity) throw new BadRequestException(`Insufficient stock for item ${line.itemId}`);
      }
      const challan = await tx.jobWorkChallan.create({ data: {
        challanNo: body.challanNo || `JW-${Date.now()}`, date: body.date ? new Date(body.date) : new Date(), jobWorkerId: Number(body.jobWorkerId),
        processType: body.processType.trim(), notes: body.notes || null, createdBy: body.createdBy || null,
        dispatchLines: { create: lines.map((line: any) => ({ itemId: Number(line.itemId), quantity: Number(line.quantity) })) },
      }, include: { dispatchLines: true } });
      for (const line of lines) await tx.stockMovement.create({ data: { itemId: Number(line.itemId), quantity: -Number(line.quantity), movementType: 'JOB_DISPATCH', referenceType: 'JOB_WORK', referenceId: String(challan.id), notes: body.processType, createdBy: body.createdBy || null } });
      return challan;
    });
  }

  async receive(challanId: number, body: any) {
    const lines = body.lines || [];
    if (!lines.length) throw new BadRequestException('At least one receipt line is required');
    return this.prisma.$transaction(async (tx) => {
      const challan = await tx.jobWorkChallan.findUnique({ where: { id: challanId }, include: { dispatchLines: true, receiptLines: true } });
      if (!challan) throw new BadRequestException('Job-work challan not found');
      if (challan.status === 'COMPLETED') throw new BadRequestException('This challan is already completed');
      for (const line of lines) {
        const qty = Number(line.quantity); const scrap = Number(line.scrapQty || 0);
        if (!line.itemId || qty <= 0 || scrap < 0) throw new BadRequestException('Receipt quantities must be valid');
        const dispatched = challan.dispatchLines.filter(d => d.itemId === Number(line.itemId)).reduce((sum, d) => sum + d.quantity, 0);
        const alreadyReceived = challan.receiptLines.filter(r => r.itemId === Number(line.itemId)).reduce((sum, r) => sum + r.quantity + r.scrapQty, 0);
        if (qty + scrap + alreadyReceived > dispatched + 0.0001) throw new BadRequestException('Received and scrap quantity cannot exceed dispatched quantity');
      }
      await tx.jobWorkReceiptLine.createMany({ data: lines.map((line: any) => ({ challanId, itemId: Number(line.itemId), quantity: Number(line.quantity), scrapQty: Number(line.scrapQty || 0) })) });
      for (const line of lines) await tx.stockMovement.create({ data: { itemId: Number(line.itemId), quantity: Number(line.quantity), movementType: 'JOB_RECEIPT', referenceType: 'JOB_WORK', referenceId: String(challanId), createdBy: body.createdBy || null, notes: scrapNote(line.scrapQty) } });
      const allReceipts = [...challan.receiptLines, ...lines.map((line: any) => ({ itemId: Number(line.itemId), quantity: Number(line.quantity), scrapQty: Number(line.scrapQty || 0) }))];
      const complete = challan.dispatchLines.every(dispatch => allReceipts.filter(r => r.itemId === dispatch.itemId).reduce((sum, r) => sum + r.quantity + r.scrapQty, 0) >= dispatch.quantity - 0.0001);
      return tx.jobWorkChallan.update({ where: { id: challanId }, data: { status: complete ? 'COMPLETED' : 'PART_RECEIVED' }, include: { jobWorker: true, dispatchLines: { include: { item: true } }, receiptLines: { include: { item: true } } } });
    });
  }

  async cancel(challanId: number, body: any) {
    return this.prisma.$transaction(async (tx) => {
      const challan = await tx.jobWorkChallan.findUnique({ where: { id: challanId }, include: { dispatchLines: true, receiptLines: true } });
      if (!challan) throw new BadRequestException('Job-work challan not found');
      if (challan.status === 'COMPLETED') throw new BadRequestException('Completed challans cannot be cancelled');
      const received = new Map<number, number>();
      for (const line of challan.receiptLines) received.set(line.itemId, (received.get(line.itemId) || 0) + line.quantity + line.scrapQty);
      for (const line of challan.dispatchLines) {
        const returnQty = line.quantity - (received.get(line.itemId) || 0);
        if (returnQty > 0) await tx.stockMovement.create({ data: { itemId: line.itemId, quantity: returnQty, movementType: 'JOB_CANCEL_RETURN', referenceType: 'JOB_WORK', referenceId: String(challanId), notes: body.notes || 'Job work cancelled' } });
      }
      return tx.jobWorkChallan.update({ where: { id: challanId }, data: { status: 'CANCELLED', notes: [challan.notes, body.notes].filter(Boolean).join('\n') || null } });
    });
  }

  async summary() {
    const challans = await this.listChallans();
    const active = challans.filter(c => !['COMPLETED', 'CANCELLED'].includes(c.status));
    const outstandingQty = active.reduce((total, c) => total + c.dispatchLines.reduce((sum, line) => sum + line.quantity, 0) - c.receiptLines.reduce((sum, line) => sum + line.quantity + line.scrapQty, 0), 0);
    return { openJobs: active.length, completedJobs: challans.filter(c => c.status === 'COMPLETED').length, outstandingQty };
  }
}

function scrapNote(scrapQty: unknown) { return Number(scrapQty || 0) > 0 ? `Scrap: ${scrapQty}` : null; }
