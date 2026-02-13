import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';

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

    @Delete('invoice/:id')
    deleteInvoice(@Param('id') id: string) {
        const index = this.invoices.findIndex(i => i.id === id);
        if (index > -1) {
            this.invoices.splice(index, 1);
            return { success: true };
        }
        return { success: false, message: 'Not found' };
    }
}
