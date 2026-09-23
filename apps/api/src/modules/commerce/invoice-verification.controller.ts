import { Controller, Get, Param } from '@nestjs/common';
import { CommerceService } from './commerce.service';

@Controller('commerce/invoices')
export class InvoiceVerificationController {
  constructor(private readonly commerce: CommerceService) {}
  @Get('verify/:key') verify(@Param('key') key: string) { return this.commerce.verifyInvoice(key); }
}
