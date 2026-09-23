import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('commerce')
@UseGuards(JwtAuthGuard)
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}
  @Get('items') listItems() { return this.commerce.listItems(); }
  @Post('items') createItem(@Body() body: any) { return this.commerce.createItem(body); }
  @Patch('items/:id') updateItem(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.updateItem(id, body); }
  @Delete('items/:id') archiveItem(@Param('id', ParseIntPipe) id: number) { return this.commerce.archiveItem(id); }
  @Get('items/:id/movements') movements(@Param('id', ParseIntPipe) id: number) { return this.commerce.itemMovements(id); }
  @Get('brands') brands() { return this.commerce.listBrands(); }
  @Post('brands') brand(@Body() body: any) { return this.commerce.createBrand(body); }
  @Patch('brands/:id') updateBrand(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.updateBrand(id, body); }
  @Delete('brands/:id') archiveBrand(@Param('id', ParseIntPipe) id: number) { return this.commerce.archiveBrand(id); }
  @Get('categories') categories() { return this.commerce.listCategories(); }
  @Post('categories') category(@Body() body: any) { return this.commerce.createCategory(body); }
  @Patch('categories/:id') updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.commerce.updateCategory(id, body); }
  @Delete('categories/:id') archiveCategory(@Param('id', ParseIntPipe) id: number) { return this.commerce.archiveCategory(id); }
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
  @Get('report') report() { return this.commerce.report(); }
}
