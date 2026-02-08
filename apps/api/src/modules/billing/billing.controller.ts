import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('billing')
export class BillingController {
    // Mock storage for invoices
    private invoices: any[] = [];

    @Post('invoice')
    createInvoice(@Body() invoice: any) {
        const newInvoice = {
            id: Math.random().toString(36).substr(2, 9),
            ...invoice,
            createdAt: new Date(),
        };
        this.invoices.push(newInvoice);
        return newInvoice;
    }

    @Get('invoices')
    getInvoices() {
        return this.invoices;
    }
}
