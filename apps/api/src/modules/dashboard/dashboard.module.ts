import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { CostingModule } from '../costing/costing.module';
import { DailySummaryService } from './daily-summary.service';

@Module({
  imports: [InventoryModule, CostingModule],
  controllers: [DashboardController],
  providers: [DailySummaryService],
})
export class DashboardModule {}
