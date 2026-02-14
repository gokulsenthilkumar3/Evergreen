import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Controller('billing')
export class BillingController {
    constructor(private prisma: PrismaService) { }

    @Post('invoice')
    async createInvoice(@Body() invoice: any) {
        const { items, ...invoiceData } = invoice;
        return (this.prisma as any).invoice.create({
            data: {
                invoiceNo: invoiceData.invoiceNo,
                date: new Date(invoiceData.date),
                customerName: invoiceData.customerName,
                customerAddress: invoiceData.customerAddress,
                customerGSTIN: invoiceData.customerGSTIN,
                transportMode: invoiceData.transportMode,
                vehicleNo: invoiceData.vehicleNo,
                subtotal: invoiceData.subtotal,
                cgst: invoiceData.cgst,
                sgst: invoiceData.sgst,
                total: invoiceData.total,
                createdBy: invoiceData.createdBy,
                items: {
                    create: items.map((item: any) => ({
                        yarnCount: item.yarnCount,
                        bags: parseInt(item.bags) || 0,
                        weight: parseFloat(item.weight) || 0,
                        rate: parseFloat(item.rate) || 0,
                    }))
                }
            },
            include: { items: true }
        });
    }

    @Get('invoices')
    async getInvoices() {
        return (this.prisma as any).invoice.findMany({
            orderBy: { date: 'desc' },
            include: { items: true }
        });
    }

    @Delete('invoice/:id')
    async deleteInvoice(@Param('id') id: string) {
        // ID is likely Int in DB but string in URL. Check schema. Invoice ID is Int.
        // Frontend sends string ID for mock but now it will receive Int ID.
        // We should parse it.
        const numId = parseInt(id);
        if (isNaN(numId)) return { success: false, message: 'Invalid ID' };

        await (this.prisma as any).invoice.delete({
            where: { id: numId }
        });
        return { success: true };
    }
}
