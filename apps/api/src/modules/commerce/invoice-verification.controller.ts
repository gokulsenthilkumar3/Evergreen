import { Controller, Get, Param } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { Public } from '../../decorators/public.decorator';

@Controller('commerce/invoices')
export class InvoiceVerificationController {
  constructor(private readonly commerce: CommerceService) {}
  @Public()
  @Get('verify/:key') verify(@Param('key') key: string) { return this.commerce.verifyInvoice(key); }
}
