import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Controller('search')
export class SearchController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async globalSearch(@Query('q') query: string) {
        if (!query || query.length < 2) return [];

        const q = query.toLowerCase();

        const [inwards, invoices, productions, outwards] = await Promise.all([
            // Search Cotton Batches
            this.prisma.inwardBatch.findMany({
                where: {
                    OR: [
                        { batchId: { contains: q } },
                        { supplier: { contains: q } },
                    ]
                },
                take: 5,
                select: { id: true, batchId: true, supplier: true, date: true }
            }),
            // Search Invoices
            this.prisma.invoice.findMany({
                where: {
                    OR: [
                        { invoiceNo: { contains: q } },
                        { customerName: { contains: q } },
                    ]
                },
                take: 5,
                select: { id: true, invoiceNo: true, customerName: true, total: true, date: true }
            }).catch(() => []),
            // Search Production (by ID roughly or date)
            (async () => {
                const id = parseInt(q.replace('#', ''));
                if (!isNaN(id)) {
                    return this.prisma.production.findMany({ where: { id }, take: 3 });
                }
                return [];
            })(),
            // Search Outwards
            this.prisma.outward.findMany({
                where: {
                    OR: [
                        { customerName: { contains: q } },
                        { vehicleNo: { contains: q } },
                    ]
                },
                take: 5
            })
        ]);

        const results: any[] = [];

        inwards.forEach((i: any) => results.push({ type: 'Batch', title: i.batchId, subtitle: i.supplier, id: i.id, page: 'inventory', date: i.date }));
        invoices.forEach((i: any) => results.push({ type: 'Invoice', title: i.invoiceNo, subtitle: `${i.customerName} - ₹${i.total?.toLocaleString()}`, id: i.id, page: 'billing', date: i.date }));
        outwards.forEach((o: any) => results.push({ type: 'Outward', title: o.customerName, subtitle: o.vehicleNo, id: o.id, page: 'inventory', date: o.date }));
        productions.forEach((p: any) => results.push({ type: 'Production', title: `Entry #${p.id}`, subtitle: `${p.totalProduced}kg Produced`, id: p.id, page: 'production', date: p.date }));

        return results;
    }
}
