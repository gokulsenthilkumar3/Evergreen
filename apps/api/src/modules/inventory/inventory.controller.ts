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
        const metrics: any = await this.inventoryService.getDashboardMetrics(from, to);
        const wasteHistory = await this.inventoryService.getWasteHistory(from, to);
        const rawStockByCount = await this.inventoryService.getYarnStockByCount();

        // Format Yarn Stock Chart (Count -> Bags)
        const yarnStockByCount = Object.entries(rawStockByCount)
            .map(([count, kg]) => ({
                name: `Count ${count}`,
                bags: Math.floor(kg / 60),
                kg: kg
            }))
            .sort((a, b) => parseInt(a.name.replace(/\D/g, '')) - parseInt(b.name.replace(/\D/g, '')));

        // Format Trend Chart (Date -> Inward Cotton vs Outward Yarn)
        const trendMap = new Map<string, { date: string, kg: number, outward: number }>();

        // Initialize with history range or just from data points
        // Using data points:
        history.forEach((item: any) => {
            const dateKey = new Date(item.date).toISOString().split('T')[0];
            if (!trendMap.has(dateKey)) {
                trendMap.set(dateKey, { date: dateKey, kg: 0, outward: 0 });
            }
            const entry = trendMap.get(dateKey)!;

            if (item.material === 'Cotton' && item.type === 'INWARD') {
                entry.kg += item.quantity;
            } else if (item.material === 'Yarn' && item.type === 'OUTWARD') {
                entry.outward += Math.abs(item.quantity);
            }
        });

        const inwardHistory = Array.from(trendMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            range,
            kpis: [
                {
                    label: 'Total Bale (Cotton)',
                    value: `${metrics.cottonBales.toLocaleString()} bales (${metrics.totalCotton.toLocaleString()} kg)`,
                    color: '#0288d1',
                    hasData: metrics.totalCotton > 0
                },
                {
                    label: 'Total Bag (Yarn)',
                    value: `${metrics.yarnBags.toLocaleString()} bags (${metrics.totalYarn.toLocaleString()} kg)`,
                    subValue: metrics.totalYarn % 60 > 0 ? `(Incomplete bag: ${(metrics.totalYarn % 60).toFixed(2)} kg)` : '',
                    color: '#2e7d32',
                    hasData: metrics.totalYarn > 0
                },
                {
                    label: 'Total Inward',
                    value: `${inwardHistory.reduce((sum, i) => sum + i.kg, 0).toLocaleString()} kg`,
                    color: '#ed6c02',
                    hasData: inwardHistory.some(i => i.kg > 0)
                },
                {
                    label: 'Total Outward (Sales)',
                    value: `${inwardHistory.reduce((sum, i) => sum + i.outward, 0).toLocaleString()} kg`,
                    color: '#d32f2f',
                    hasData: inwardHistory.some(i => i.outward > 0)
                },
            ],
            history,
            totalBales: metrics.cottonBales,
            yarnStockByCount,
            inwardHistory, // This now contains the trend data structure
            outwardHistory: [], // Not used by charts directly, legacy?
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

    @Get('yarn-stock')
    async getStockByCount() {
        return this.inventoryService.getYarnStockByCount();
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
