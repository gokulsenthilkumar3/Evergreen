import { Module } from '@nestjs/common';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { InvoiceVerificationController } from './invoice-verification.controller';

@Module({ controllers: [CommerceController, StorefrontController, InvoiceVerificationController], providers: [CommerceService, StorefrontService], exports: [CommerceService] })
export class CommerceModule {}
