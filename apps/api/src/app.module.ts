import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CostingModule } from './modules/costing/costing.module';

import { ProductionModule } from './modules/production/production.module';
import { BillingModule } from './modules/billing/billing.module';
import { LogsModule } from './modules/logs/logs.module';

import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [DatabaseModule, DashboardModule, AuthModule, InventoryModule, CostingModule, ProductionModule, BillingModule, LogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
