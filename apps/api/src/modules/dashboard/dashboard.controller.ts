import { Controller, Get, Query } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('summary')
    async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
        const metrics = await this.inventoryService.getDashboardMetrics(from, to);

        const hasProductionData = metrics.totalYarn > 0;
        const hasCottonData = metrics.totalCotton > 0;
        const hasWasteData = false;
        const hasCostData = false;

        return {
            kpis: [
                {
                    label: 'Total Production',
                    value: hasProductionData ? `${metrics.totalYarn} kg` : 'No Data',
                    subValue: '',
                    color: '#2e7d32',
                    trend: '',
                    comparison: '',
                    hasData: hasProductionData
                },
                {
                    label: 'Total Stock (Cotton)',
                    value: hasCottonData ? `${metrics.totalCotton} kg` : 'No Data',
                    subValue: '',
                    color: '#0288d1',
                    trend: '',
                    comparison: '',
                    hasData: hasCottonData
                },
                {
                    label: 'Waste Rate',
                    value: hasWasteData ? '2.4%' : 'No Data',
                    subValue: '',
                    color: '#d32f2f',
                    trend: '',
                    comparison: '',
                    hasData: hasWasteData
                },
                {
                    label: 'Total Cost',
                    value: hasCostData ? '₹45,200' : 'No Data',
                    subValue: '',
                    color: '#ed6c02',
                    trend: '',
                    comparison: '',
                    hasData: hasCostData
                },
            ]
        };
    }
}
