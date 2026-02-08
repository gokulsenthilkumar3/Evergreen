import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
    imports: [InventoryModule],
    controllers: [DashboardController],
})
export class DashboardModule { }
