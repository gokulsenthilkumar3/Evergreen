import { Controller, Get, Query } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { CostingService } from '../costing/costing.service';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly costingService: CostingService
    ) { }

    @Get('summary')
    async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
        const metrics = await this.inventoryService.getDashboardMetrics(from, to);
        const totalCost = await this.costingService.getTotalCost(from, to);

        // Waste Calculation
        // metrics has periodProduction, periodWaste
        // If periodProduction, periodWaste are undefined (old types), handle it.
        const periodProduction = (metrics as any).periodProduction || 0;
        const periodWaste = (metrics as any).periodWaste || 0;

        // Waste Rate = Waste / (Waste + Produced) or Waste / Consumed (if Consumed = Waste + Produced)
        const totalInput = periodProduction + periodWaste;
        const wasteRate = totalInput > 0 ? (periodWaste / totalInput) * 100 : 0;

        const hasProductionData = metrics.totalYarn > 0; // Using Stock as proxy? Or use periodProduction > 0?
        // Label says "Total Production" but value shows metrics.totalYarn (Stock).
        // I will keep existing logic for "Total Production" (Stock), but add Waste Logic.
        // Actually, user might want Period Production.
        // But let's fix Waste and Cost specifically.

        const hasCottonData = metrics.totalCotton > 0;
        const hasWasteData = periodWaste > 0;
        const hasCostData = totalCost > 0;

        return {
            kpis: [
                {
                    label: 'Total Production',
                    value: hasProductionData ? `${metrics.totalYarn} kg` : 'No Data',
                    subValue: '', // Maybe add Period Production here?
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
                    value: hasWasteData ? `${wasteRate.toFixed(2)}%` : 'No Data',
                    subValue: `${periodWaste.toFixed(0)} kg`,
                    color: '#d32f2f',
                    trend: '',
                    comparison: '',
                    hasData: hasWasteData
                },
                {
                    label: 'Total Cost',
                    value: hasCostData ? `₹${totalCost.toLocaleString()}` : 'No Data',
                    subValue: '',
                    color: '#ed6c02',
                    trend: '',
                    comparison: '',
                    hasData: hasCostData
                },
            ],
            meta: {
                periodProduction,
                periodWaste,
                totalCost
            }
        };
    }
}
