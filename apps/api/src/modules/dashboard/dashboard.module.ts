import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { CostingModule } from '../costing/costing.module';
import { PrismaService } from '../../services/prisma.service';

@Module({
    imports: [InventoryModule, CostingModule],
    controllers: [DashboardController],
    providers: [PrismaService],
})
export class DashboardModule { }
