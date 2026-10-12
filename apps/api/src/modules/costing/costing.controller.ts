import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Param,
  Put,
  Req,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CostingService } from './costing.service';
import type { AuthenticatedRequest } from '../../types/authenticated-request';

const DUPLICATE_ENTRY = 'An entry already exists for this date. Edit that entry instead.';

export enum DateRange {
  MONTH = 'month',
  THREE_MONTHS = '3months',
  YEAR = 'year',
  ALL = 'all',
}

@Controller('costing')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Get('history')
  async getCostingHistory(@Query('range') range: DateRange = DateRange.MONTH) {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case DateRange.MONTH:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case DateRange.THREE_MONTHS:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        );
        break;
      case DateRange.YEAR:
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      case DateRange.ALL:
        startDate = new Date(2020, 0, 1);
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
    }

    const summary = await this.costingService.getCostSummary(startDate, now);
    const dailyTrend = await this.costingService.getDailyCostSummary(
      startDate,
      now,
    );

    return {
      range,
      startDate,
      endDate: now,
      summary,
      electricityHistory: await this.costingService.getHistoryByCategory(
        'EB (Electricity)',
        startDate,
        now,
      ),
      employeeHistory: await this.costingService.getHistoryByCategory(
        'Employee',
        startDate,
        now,
      ),
      packagingHistory: await this.costingService.getHistoryByCategory(
        'Packaging',
        startDate,
        now,
      ),
      maintenanceHistory: await this.costingService.getHistoryByCategory(
        'Maintenance',
        startDate,
        now,
      ),
      expenseHistory: await this.costingService.getHistoryByCategory(
        'Expense',
        startDate,
        now,
      ),
      dailyCostSummary: dailyTrend,
    };
  }

  @Get('entries')
  async getCostEntries() {
    return this.costingService.getCostEntries();
  }

  @Post('eb')
  async createEBCost(@Body() entry: any, @Req() req: AuthenticatedRequest) {
    if (await this.costingService.exists(entry.date, 'EB (Electricity)')) throw new ConflictException(DUPLICATE_ENTRY);
    return this.costingService.addEntry({ ...entry, category: 'EB (Electricity)', createdBy: req.user.username });
  }

  @Post('employee')
  async createEmployeeCost(@Body() entry: any, @Req() req: AuthenticatedRequest) {
    if (await this.costingService.exists(entry.date, 'Employee')) throw new ConflictException(DUPLICATE_ENTRY);
    return this.costingService.addEntry({ ...entry, category: 'Employee', createdBy: req.user.username });
  }

  @Post('packaging')
  async createPackagingCost(@Body() entry: any, @Req() req: AuthenticatedRequest) {
    if (await this.costingService.exists(entry.date, 'Packaging')) throw new ConflictException(DUPLICATE_ENTRY);
    return this.costingService.addEntry({ ...entry, category: 'Packaging', createdBy: req.user.username });
  }

  @Post('maintenance')
  async createMaintenanceCost(@Body() entry: any, @Req() req: AuthenticatedRequest) {
    if (await this.costingService.exists(entry.date, 'Maintenance')) throw new ConflictException(DUPLICATE_ENTRY);
    return this.costingService.addEntry({ ...entry, category: 'Maintenance', createdBy: req.user.username });
  }

  @Post('expense')
  async createExpense(@Body() entry: any, @Req() req: AuthenticatedRequest) {
    return this.costingService.addEntry({
      type: 'General',
      details: `${entry.title} (${entry.type || 'General'})`,
      totalCost: entry.amount,
      ...entry,
      category: entry.category || 'Expense',
      createdBy: req.user.username,
    });
  }

  @Delete(':id')
  async deleteEntry(@Param('id') id: string) {
    if (!(await this.costingService.deleteEntry(id))) throw new NotFoundException('Cost entry not found');
    return { success: true };
  }

  @Put(':id')
  async updateEntry(@Param('id') id: string, @Body() entry: any, @Req() req: AuthenticatedRequest) {
    const updated = await this.costingService.updateEntry(id, { ...entry, updatedBy: req.user.username });
    if (!updated) throw new NotFoundException('Cost entry not found');
    return updated;
  }
}
