import { Controller, Get, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';

export enum DateRange {
    MONTH = 'month',
    THREE_MONTHS = '3months',
    YEAR = 'year',
    ALL = 'all',
}

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('history')
    async getInventoryHistory(
        @Query('range') range: DateRange = DateRange.MONTH,
        @Query('from') from?: string,
        @Query('to') to?: string
    ) {
        const history = await this.inventoryService.getHistory(from, to);
        const metrics = await this.inventoryService.getDashboardMetrics(from, to);
        const wasteHistory = await this.inventoryService.getWasteHistory(from, to);

        return {
            range,
            kpis: [
                {
                    label: 'Total Bale (Cotton)',
                    value: `${metrics.totalCotton || 0} kg`,
                    color: '#0288d1',
                    hasData: metrics.totalCotton > 0
                },
                {
                    label: 'Total Bag (Yarn)',
                    value: `${metrics.totalYarn || 0} kg`,
                    color: '#2e7d32',
                    hasData: metrics.totalYarn > 0
                },
                {
                    label: 'Total Inward',
                    value: '0 kg',
                    color: '#ed6c02',
                    hasData: false
                },
                {
                    label: 'Waste Generated',
                    value: '0 kg',
                    color: '#d32f2f',
                    hasData: false
                },
            ],
            history,
            totalBales: metrics.totalBales,
            yarnStockByCount: [],
            inwardHistory: [],
            outwardHistory: [],
            productionHistory: [],
            wasteHistory,
        };
    }

    @Post('inward')
    async createInward(@Body() data: any) {
        return this.inventoryService.createInward(data);
    }

    @Post('outward')
    async createOutward(@Body() data: any) {
        return this.inventoryService.createOutward(data);
    }

    @Get('outward')
    async getOutwardHistory(
        @Query('from') from?: string,
        @Query('to') to?: string
    ) {
        return this.inventoryService.getOutwardHistory(from, to);
    }

    @Get('inward')
    async getInwardHistory(
        @Query('from') from?: string,
        @Query('to') to?: string
    ) {
        return this.inventoryService.getInwardHistory(from, to);
    }

    @Get('available-batches')
    async getAvailableBatches() {
        return this.inventoryService.getAvailableBatches();
    }

    @Get('cotton-inventory')
    async getCottonInventory(@Query('range') range: DateRange = DateRange.MONTH) {
        // This should also come from service eventually
        return {
            range,
            batches: [],
            totalStock: 0,
        };
    }

    @Get('yarn-inventory')
    async getYarnInventory(@Query('range') range: DateRange = DateRange.MONTH) {
        return {
            range,
            inventory: [],
            totalStock: 0,
        };
    }

    @Delete('inward/:id')
    async deleteInward(@Param('id') id: string) {
        return this.inventoryService.deleteInward(parseInt(id));
    }

    @Delete('outward/:id')
    async deleteOutward(@Param('id') id: string) {
        return this.inventoryService.deleteOutward(parseInt(id));
    }
}
