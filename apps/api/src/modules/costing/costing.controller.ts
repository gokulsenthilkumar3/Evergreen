import { Controller, Get, Post, Body, Query, Delete, Param, Put } from '@nestjs/common';

export enum DateRange {
    MONTH = 'month',
    THREE_MONTHS = '3months',
    YEAR = 'year',
    ALL = 'all',
}

@Controller('costing')
export class CostingController {
    @Get('history')
    getCostingHistory(@Query('range') range: DateRange = DateRange.MONTH) {
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

        return {
            range,
            startDate,
            endDate: now,
            summary: {
                totalElectricityCost: 125000,
                totalEmployeeCost: 85000,
                totalPackagingCost: 42000,
                totalMaintenanceCost: 38000,
                totalExpenses: 25000,
                grandTotal: 315000,
            },
            electricityHistory: this.generateMockElectricityData(startDate, now),
            employeeHistory: this.generateMockEmployeeData(startDate, now),
            packagingHistory: this.generateMockPackagingData(startDate, now),
            maintenanceHistory: this.generateMockMaintenanceData(startDate, now),
            expenseHistory: this.generateMockExpenseData(startDate, now),
            dailyCostSummary: this.generateMockDailyCostSummary(startDate, now),
        };
    }

    @Get('breakdown')
    getCostBreakdown(@Query('range') range: DateRange = DateRange.MONTH) {
        return {
            range,
            breakdown: [
                { category: 'Electricity (EB)', amount: 125000, percentage: 39.7, color: '#f59e0b' },
                { category: 'Employee Costs', amount: 85000, percentage: 27.0, color: '#3b82f6' },
                { category: 'Packaging', amount: 42000, percentage: 13.3, color: '#10b981' },
                { category: 'Maintenance', amount: 38000, percentage: 12.1, color: '#ef4444' },
                { category: 'Other Expenses', amount: 25000, percentage: 7.9, color: '#8b5cf6' },
            ],
            total: 315000,
        };
    }

    @Get('cost-per-kg')
    getCostPerKg(@Query('range') range: DateRange = DateRange.MONTH) {
        return {
            range,
            costPerKg: {
                electricity: 8.5,
                employee: 5.8,
                packaging: 2.9,
                maintenance: 2.6,
                other: 1.7,
                total: 21.5,
            },
            totalProduction: 14650, // kg
        };
    }

    // Mock storage for cost entries
    private costEntries: any[] = [];

    @Post('eb')
    createEBCost(@Body() entry: any) {
        if (this.costEntries.some(e => e.date === entry.date && e.category === 'EB (Electricity)')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'EB (Electricity)',
            details: `${entry.unitsConsumed} kWh @ ₹${entry.ratePerUnit}/unit (${entry.noOfShifts} Shifts)`,
            ...entry,
            createdAt: new Date(),
        };
        this.costEntries.push(newEntry);
        return newEntry;
    }

    @Post('employee')
    createEmployeeCost(@Body() entry: any) {
        if (this.costEntries.some(e => e.date === entry.date && e.category === 'Employee')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'Employee',
            details: `${entry.workers} Workers (${entry.noOfShifts} Shifts)`,
            ...entry,
            createdAt: new Date(),
        };
        this.costEntries.push(newEntry);
        return newEntry;
    }

    @Post('packaging')
    createPackagingCost(@Body() entry: any) {
        if (this.costEntries.some(e => e.date === entry.date && e.category === 'Packaging')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'Packaging',
            details: `For ${entry.yarnProduced?.toFixed(2)} kg Yarn`,
            ...entry,
            createdAt: new Date(),
        };
        this.costEntries.push(newEntry);
        return newEntry;
    }

    @Post('maintenance')
    createMaintenanceCost(@Body() entry: any) {
        if (this.costEntries.some(e => e.date === entry.date && e.category === 'Maintenance')) {
            throw new Error('Entry already exists for this date');
        }
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'Maintenance',
            details: entry.description,
            ...entry,
            createdAt: new Date(),
        };
        this.costEntries.push(newEntry);
        return newEntry;
    }

    @Post('expense')
    createExpense(@Body() entry: any) {
        const newEntry = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'Expense', // Sub-category in type
            details: `${entry.title} (${entry.type})`,
            totalCost: parseFloat(entry.amount),
            ...entry,
            createdAt: new Date(),
        };
        this.costEntries.push(newEntry);
        return newEntry;
    }

    @Get('entries')
    getCostEntries() {
        return this.costEntries;
    }

    @Delete(':id')
    deleteEntry(@Param('id') id: string) {
        const index = this.costEntries.findIndex(e => e.id === id);
        if (index > -1) {
            this.costEntries.splice(index, 1);
            return { success: true };
        }
        return { success: false, message: 'Not found' };
    }

    @Put(':id')
    updateEntry(@Param('id') id: string, @Body() entry: any) {
        const index = this.costEntries.findIndex(e => e.id === id);
        if (index > -1) {
            const updatedEntry = { ...this.costEntries[index], ...entry };

            // Regenerate details based on category
            if (updatedEntry.category === 'EB (Electricity)') {
                updatedEntry.details = `${updatedEntry.unitsConsumed} kWh @ ₹${updatedEntry.ratePerUnit}/unit (${updatedEntry.noOfShifts} Shifts)`;
            } else if (updatedEntry.category === 'Employee') {
                updatedEntry.details = `${updatedEntry.workers} Workers (${updatedEntry.noOfShifts} Shifts)`;
            } else if (updatedEntry.category === 'Packaging') {
                updatedEntry.details = `For ${updatedEntry.yarnProduced?.toFixed(2)} kg Yarn`;
            } else if (updatedEntry.category === 'Maintenance') {
                updatedEntry.details = updatedEntry.description;
            }

            this.costEntries[index] = updatedEntry;
            return this.costEntries[index];
        }
        return { success: false, message: 'Not found' };
    }

    private generateMockElectricityData(start: Date, end: Date) {
        const data = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const interval = Math.max(1, Math.floor(days / 20));

        for (let i = 0; i < days; i += interval) {
            const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                units: Math.floor(Math.random() * 500) + 300,
                cost: Math.floor(Math.random() * 5000) + 3000,
            });
        }
        return data;
    }

    private generateMockEmployeeData(start: Date, end: Date) {
        const data = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const interval = Math.max(1, Math.floor(days / 20));

        for (let i = 0; i < days; i += interval) {
            const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                shifts: Math.floor(Math.random() * 3) + 2,
                employees: Math.floor(Math.random() * 10) + 15,
                cost: Math.floor(Math.random() * 4000) + 2500,
            });
        }
        return data;
    }

    private generateMockPackagingData(start: Date, end: Date) {
        const data = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const interval = Math.max(1, Math.floor(days / 20));

        for (let i = 0; i < days; i += interval) {
            const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                totalKg: Math.floor(Math.random() * 1000) + 500,
                cost: Math.floor(Math.random() * 2000) + 1000,
            });
        }
        return data;
    }

    private generateMockMaintenanceData(start: Date, end: Date) {
        const data = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const interval = Math.max(1, Math.floor(days / 20));

        for (let i = 0; i < days; i += interval) {
            const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                cost: Math.floor(Math.random() * 2000) + 800,
                description: 'Routine maintenance',
            });
        }
        return data;
    }

    private generateMockExpenseData(start: Date, end: Date) {
        const data = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const interval = Math.max(1, Math.floor(days / 20));

        for (let i = 0; i < days; i += interval) {
            const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                category: ['Office Supplies', 'Transport', 'Utilities', 'Miscellaneous'][Math.floor(Math.random() * 4)],
                amount: Math.floor(Math.random() * 1500) + 500,
            });
        }
        return data;
    }

    private generateMockDailyCostSummary(start: Date, end: Date) {
        const data = [];
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const interval = Math.max(1, Math.floor(days / 20));

        for (let i = 0; i < days; i += interval) {
            const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            const ebCost = Math.floor(Math.random() * 5000) + 3000;
            const empCost = Math.floor(Math.random() * 4000) + 2500;
            const pkgCost = Math.floor(Math.random() * 2000) + 1000;
            const maintCost = Math.floor(Math.random() * 2000) + 800;
            const expCost = Math.floor(Math.random() * 1500) + 500;

            data.push({
                date: date.toISOString().split('T')[0],
                ebCost,
                employeeCost: empCost,
                packageCost: pkgCost,
                maintenanceCost: maintCost,
                expenseCost: expCost,
                totalCost: ebCost + empCost + pkgCost + maintCost + expCost,
            });
        }
        return data;
    }
}
