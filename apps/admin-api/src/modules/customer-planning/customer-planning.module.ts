import { Module } from '@nestjs/common';
import { CustomerPlanningController } from './customer-planning.controller';
import { CustomerPlanningService } from './customer-planning.service';

@Module({ controllers: [CustomerPlanningController], providers: [CustomerPlanningService], exports: [CustomerPlanningService] })
export class CustomerPlanningModule {}
