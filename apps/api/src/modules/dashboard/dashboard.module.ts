import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { CostingModule } from '../costing/costing.module';

@Module({
    imports: [InventoryModule, CostingModule],
    controllers: [DashboardController],
})
export class DashboardModule { }
