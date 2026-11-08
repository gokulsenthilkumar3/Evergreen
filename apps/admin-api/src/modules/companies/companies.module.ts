import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { TenantRoutingController } from './tenant-routing.controller';

@Module({
  controllers: [CompaniesController, TenantRoutingController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
