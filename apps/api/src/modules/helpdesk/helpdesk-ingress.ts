import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { Public } from '../../decorators/public.decorator';
import { HelpdeskRateLimitGuard } from '../../guards/public-order-rate-limit.guard';
import { HelpdeskOperationsService } from './helpdesk-operations.service';
import { verifySupportIngress } from './helpdesk-ingress-auth';
export class SupportIngressDto {
  @IsString() @Length(1, 160) externalId!: string;
  @IsString() @Length(3, 160) subject!: string;
  @IsString() @Length(10, 4000) description!: string;
  @IsIn(['BUG', 'QUESTION', 'ACCESS', 'INTEGRATION', 'BILLING', 'DATA'])
  category!: string;
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority!: string;
  @IsOptional() @IsString() @Length(1, 80) ticketId?: string;
  @IsOptional() @IsEmail() senderEmail?: string;
  @IsOptional() @IsIn(['DKIM_PASS_ALIGNED']) senderAssurance?: string;
}
@Controller('helpdesk/ingress')
export class HelpdeskIngressController {
  constructor(private readonly service: HelpdeskOperationsService) {}
  @Post(':source')
  @Public()
  @UseGuards(HelpdeskRateLimitGuard)
  ingest(
    @Param('source') source: string,
    @Body() body: SupportIngressDto,
    @Headers('x-support-timestamp') timestamp: string,
    @Headers('x-support-nonce') nonce: string,
    @Headers('x-support-signature') signature: string,
  ) {
    const digest = verifySupportIngress(
      source,
      body,
      timestamp || '',
      nonce || '',
      signature || '',
    );
    return this.service.ingest(source, body, digest, nonce);
  }
}
