import { Controller, Get, Post, Body, Delete, Param, Put, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Controller('billing')
export class BillingController {
    constructor(private prisma: PrismaService) { }

    @Post('invoice')
    async createInvoice(@Body() invoice: any) {
        const { items, ...invoiceData } = invoice;

        // Validation
        if (!invoiceData.customerName?.trim()) {
            throw new BadRequestException('Customer name is required');
        }
        if (!invoiceData.invoiceNo?.trim()) {
            throw new BadRequestException('Invoice number is required');
        }
        if (!items || items.length === 0) {
            throw new BadRequestException('At least one line item is required');
        }

        // Validate items
        for (const item of items) {
            if (!item.yarnCount) throw new BadRequestException('Yarn count is required for all items');
            if (!item.weight || parseFloat(item.weight) <= 0) throw new BadRequestException('Weight must be greater than 0 for all items');
            if (!item.rate || parseFloat(item.rate) <= 0) throw new BadRequestException('Rate must be greater than 0 for all items');
        }

        // Check for duplicate invoice number
        const existing = await this.prisma.invoice.findUnique({
            where: { invoiceNo: invoiceData.invoiceNo }
        });
        if (existing) {
            throw new BadRequestException(`Invoice number ${invoiceData.invoiceNo} already exists`);
        }

        return this.prisma.invoice.create({
            data: {
                invoiceNo: invoiceData.invoiceNo,
                date: new Date(invoiceData.date),
                customerName: invoiceData.customerName,
                customerAddress: invoiceData.customerAddress || '',
                customerGSTIN: invoiceData.customerGSTIN || '',
                transportMode: invoiceData.transportMode || 'Road',
                vehicleNo: invoiceData.vehicleNo || '',
                subtotal: invoiceData.subtotal,
                cgst: invoiceData.cgst,
                sgst: invoiceData.sgst,
                total: invoiceData.total,
                status: 'UNPAID',
                amountPaid: 0,
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
            include: { items: true, payments: true }
        });
    }

    @Get('invoices')
    async getInvoices() {
        return this.prisma.invoice.findMany({
            orderBy: { date: 'desc' },
            include: { items: true, payments: { orderBy: { date: 'desc' } } }
        });
    }

    @Get('invoice/:id')
    async getInvoice(@Param('id') id: string) {
        const numId = parseInt(id);
        if (isNaN(numId)) throw new BadRequestException('Invalid ID');

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: numId },
            include: { items: true, payments: { orderBy: { date: 'desc' } } }
        });

        if (!invoice) throw new BadRequestException('Invoice not found');
        return invoice;
    }

    @Delete('invoice/:id')
    async deleteInvoice(@Param('id') id: string) {
        const numId = parseInt(id);
        if (isNaN(numId)) throw new BadRequestException('Invalid ID');

        await this.prisma.invoice.delete({
            where: { id: numId }
        });
        return { success: true };
    }

    // ---- Payment Tracking ----

    @Post('invoice/:id/payment')
    async addPayment(@Param('id') id: string, @Body() body: any) {
        const numId = parseInt(id);
        if (isNaN(numId)) throw new BadRequestException('Invalid invoice ID');

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: numId }
        });
        if (!invoice) throw new BadRequestException('Invoice not found');

        const amount = parseFloat(body.amount);
        if (!amount || amount <= 0) {
            throw new BadRequestException('Payment amount must be greater than 0');
        }

        const remaining = invoice.total - invoice.amountPaid;
        if (amount > remaining + 0.01) { // Small tolerance for floating point
            throw new BadRequestException(`Payment amount (₹${amount}) exceeds remaining balance (₹${remaining.toFixed(2)})`);
        }

        if (!body.method) {
            throw new BadRequestException('Payment method is required');
        }

        const newAmountPaid = invoice.amountPaid + amount;
        const newStatus = newAmountPaid >= invoice.total - 0.01 ? 'PAID' : 'PARTIAL';

        // Create payment and update invoice in a transaction
        const result = await this.prisma.$transaction([
            this.prisma.payment.create({
                data: {
                    invoiceId: numId,
                    date: body.date ? new Date(body.date) : new Date(),
                    amount: amount,
                    method: body.method,
                    reference: body.reference || null,
                    notes: body.notes || null,
                    createdBy: body.createdBy || null,
                }
            }),
            this.prisma.invoice.update({
                where: { id: numId },
                data: {
                    amountPaid: newAmountPaid,
                    status: newStatus,
                }
            })
        ]);

        return {
            payment: result[0],
            invoice: result[1],
            message: newStatus === 'PAID' ? 'Invoice fully paid!' : `Partial payment recorded. Remaining: ₹${(invoice.total - newAmountPaid).toFixed(2)}`
        };
    }

    @Get('invoice/:id/payments')
    async getPaymentHistory(@Param('id') id: string) {
        const numId = parseInt(id);
        if (isNaN(numId)) throw new BadRequestException('Invalid invoice ID');

        return this.prisma.payment.findMany({
            where: { invoiceId: numId },
            orderBy: { date: 'desc' }
        });
    }

    @Delete('payment/:id')
    async deletePayment(@Param('id') id: string) {
        const numId = parseInt(id);
        if (isNaN(numId)) throw new BadRequestException('Invalid payment ID');

        const payment = await this.prisma.payment.findUnique({
            where: { id: numId }
        });
        if (!payment) throw new BadRequestException('Payment not found');

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: payment.invoiceId }
        });
        if (!invoice) throw new BadRequestException('Invoice not found for this payment');

        const newAmountPaid = Math.max(0, invoice.amountPaid - payment.amount);
        const newStatus = newAmountPaid <= 0.01 ? 'UNPAID' : (newAmountPaid >= invoice.total - 0.01 ? 'PAID' : 'PARTIAL');

        await this.prisma.$transaction([
            this.prisma.payment.delete({
                where: { id: numId }
            }),
            this.prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                    amountPaid: newAmountPaid,
                    status: newStatus,
                }
            })
        ]);

        return { success: true, message: 'Payment deleted and invoice updated' };
    }
}
