import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CommerceService } from './commerce.service';

@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}
  @Get('items') listItems() { return this.commerce.listItems(); }
  @Post('items') createItem(@Body() body: any) { return this.commerce.createItem(body); }
  @Patch('items/:id') updateItem(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.updateItem(id, body); }
  @Delete('items/:id') archiveItem(@Param('id', ParseIntPipe) id: number) { return this.commerce.archiveItem(id); }
  @Get('items/:id/movements') movements(@Param('id', ParseIntPipe) id: number) { return this.commerce.itemMovements(id); }
  @Get('brands') brands() { return this.commerce.listBrands(); }
  @Post('brands') brand(@Body() body: any) { return this.commerce.createBrand(body); }
  @Get('categories') categories() { return this.commerce.listCategories(); }
  @Post('categories') category(@Body() body: any) { return this.commerce.createCategory(body); }
  @Post('items/:id/adjust') adjust(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.adjustStock(id, body); }
  @Get('customers') customers() { return this.commerce.listCustomers(); }
  @Post('customers') customer(@Body() body: any) { return this.commerce.createCustomer(body); }
  @Patch('customers/:id') updateCustomer(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.updateCustomer(id, body); }
  @Get('customers/:id/ledger') ledger(@Param('id', ParseIntPipe) id: number) { return this.commerce.customerLedger(id); }
  @Get('orders') orders() { return this.commerce.listOrders(); }
  @Post('orders') order(@Body() body: any) { return this.commerce.createOrder(body); }
  @Post('orders/:id/cancel') cancelOrder(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.cancelOrder(id, body); }
  @Post('inward-receipts') inward(@Body() body: any) { return this.commerce.createInwardReceipt(body); }
  @Get('inward-receipts') inwardList() { return this.commerce.listInwardReceipts(); }
  @Get('costing-sheets') costingSheets() { return this.commerce.listCostingSheets(); }
  @Post('costing-sheets') costingSheet(@Body() body: any) { return this.commerce.createCostingSheet(body); }
  @Patch('costing-sheets/:id') updateCostingSheet(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.updateCostingSheet(id, body); }
  @Get('invoices') invoices() { return this.commerce.listInvoices(); }
  @Post('invoices') invoice(@Body() body: any) { return this.commerce.createInvoice(body); }
  @Post('invoices/:id/payments') payment(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.recordInvoicePayment(id, body); }
  @Post('invoices/:id/void') voidInvoice(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.voidInvoice(id, body); }
  @Get('invoices/verify/:key') verify(@Param('key') key: string) { return this.commerce.verifyInvoice(key); }
  @Get('report') report() { return this.commerce.report(); }
}
