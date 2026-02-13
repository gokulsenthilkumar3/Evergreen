import { Controller, Get, Post, Body, Query, Delete, Param, Put } from '@nestjs/common';
import { CostingService } from './costing.service';

export enum DateRange {
    MONTH = 'month',
    THREE_MONTHS = '3months',
    YEAR = 'year',
    ALL = 'all',
}

@Controller('costing')
export class CostingController {
    constructor(private readonly costingService: CostingService) { }

    @Get('history')
    async getCostingHistory(@Query('range') range: DateRange = DateRange.MONTH) {
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case DateRange.MONTH:
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case DateRange.THREE_MONTHS:
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case DateRange.YEAR:
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case DateRange.ALL:
                startDate = new Date(2020, 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }

        const summary = await this.costingService.getCostSummary(startDate, now);
        const dailyTrend = await this.costingService.getDailyCostSummary(startDate, now);

        return {
            range,
            startDate,
            endDate: now,
            summary,
            electricityHistory: await this.costingService.getHistoryByCategory('EB (Electricity)', startDate, now),
            employeeHistory: await this.costingService.getHistoryByCategory('Employee', startDate, now),
            packagingHistory: await this.costingService.getHistoryByCategory('Packaging', startDate, now),
            maintenanceHistory: await this.costingService.getHistoryByCategory('Maintenance', startDate, now),
            expenseHistory: await this.costingService.getHistoryByCategory('Expense', startDate, now),
            dailyCostSummary: dailyTrend,
        };
    }

    @Get('entries')
    async getCostEntries() {
        return this.costingService.getCostEntries();
    }

    @Post('eb')
    async createEBCost(@Body() entry: any) {
        if (await this.costingService.exists(entry.date, 'EB (Electricity)')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            category: 'EB (Electricity)',
            details: `${entry.unitsConsumed} kWh @ ₹${entry.ratePerUnit}/unit (${entry.noOfShifts} Shifts)`,
            ...entry,
        };
        return this.costingService.addEntry(newEntry);
    }

    @Post('employee')
    async createEmployeeCost(@Body() entry: any) {
        if (await this.costingService.exists(entry.date, 'Employee')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            category: 'Employee',
            details: `${entry.workers} Workers (${entry.noOfShifts} Shifts)`,
            ...entry,
        };
        return this.costingService.addEntry(newEntry);
    }

    @Post('packaging')
    async createPackagingCost(@Body() entry: any) {
        if (await this.costingService.exists(entry.date, 'Packaging')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            category: 'Packaging',
            details: `For ${entry.yarnProduced?.toFixed(2)} kg Yarn`,
            ...entry,
        };
        return this.costingService.addEntry(newEntry);
    }

    @Post('maintenance')
    async createMaintenanceCost(@Body() entry: any) {
        if (await this.costingService.exists(entry.date, 'Maintenance')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            category: 'Maintenance',
            details: entry.description,
            ...entry,
        };
        return this.costingService.addEntry(newEntry);
    }

    @Post('expense')
    async createExpense(@Body() entry: any) {
        const newEntry = {
            category: expect(entry.category) || 'Expense',
            type: entry.type || 'General',
            details: `${entry.title} (${entry.type})`,
            totalCost: entry.amount,
            ...entry,
        };
        return this.costingService.addEntry(newEntry);
    }

    @Delete(':id')
    async deleteEntry(@Param('id') id: string) {
        const success = await this.costingService.deleteEntry(id);
        if (success) return { success: true };
        return { success: false, message: 'Not found' };
    }

    @Put(':id')
    async updateEntry(@Param('id') id: string, @Body() entry: any) {
        // Logic remains: backend rebuilds details
        // But since we persist specific fields in DB, do we need to rebuild detail string?
        // Ideally frontend specific fields update -> details update automatically via Model hook or Service logic?
        // Here controller handles it.
        // But we need to know previous values?
        // Assuming entry contains updated specific fields.

        let details = entry.details;

        if (entry.category === 'EB (Electricity)') {
            details = `${entry.unitsConsumed} kWh @ ₹${entry.ratePerUnit}/unit (${entry.noOfShifts} Shifts)`;
        } else if (entry.category === 'Employee') {
            details = `${entry.workers} Workers (${entry.noOfShifts} Shifts)`;
        } else if (entry.category === 'Packaging') {
            details = `For ${parseFloat(entry.yarnProduced)?.toFixed(2)} kg Yarn`;
        } else if (entry.category === 'Maintenance') {
            details = entry.description;
        }

        const formatted = {
            ...entry,
            details
        };

        const updated = await this.costingService.updateEntry(id, formatted);
        if (updated) return updated;
        return { success: false, message: 'Not found' };
    }
}

// Helper to handle Expense category fallback
function expect(val: any) { return val; }
