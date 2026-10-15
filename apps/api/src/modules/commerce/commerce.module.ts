import { Module } from '@nestjs/common';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { InvoiceVerificationController } from './invoice-verification.controller';
import { WhatsAppCollectionsService } from './whatsapp-collections.service';

@Module({
  controllers: [
    CommerceController,
    StorefrontController,
    InvoiceVerificationController,
  ],
  providers: [CommerceService, StorefrontService, WhatsAppCollectionsService],
  exports: [CommerceService, WhatsAppCollectionsService],
})
export class CommerceModule {}
