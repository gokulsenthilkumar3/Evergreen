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
  NotFoundException,
} from '@nestjs/common';
import { CostingService } from './costing.service';
import {
  CreateEbCostDto,
  CreateEmployeeCostDto,
  CreateExpenseDto,
  CreateMaintenanceCostDto,
  CreatePackagingCostDto,
  UpdateCostingEntryDto,
} from './costing.dto';
import type { AuthenticatedRequest } from '../../types/authenticated-request';

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
  createEBCost(@Body() entry: CreateEbCostDto, @Req() req: AuthenticatedRequest) {
    return this.costingService.addEntry({ ...entry, category: 'EB (Electricity)', createdBy: req.user.username });
  }

  @Post('employee')
  createEmployeeCost(@Body() entry: CreateEmployeeCostDto, @Req() req: AuthenticatedRequest) {
    return this.costingService.addEntry({ ...entry, category: 'Employee', createdBy: req.user.username });
  }

  @Post('packaging')
  createPackagingCost(@Body() entry: CreatePackagingCostDto, @Req() req: AuthenticatedRequest) {
    return this.costingService.addEntry({ ...entry, category: 'Packaging', createdBy: req.user.username });
  }

  @Post('maintenance')
  createMaintenanceCost(@Body() entry: CreateMaintenanceCostDto, @Req() req: AuthenticatedRequest) {
    return this.costingService.addEntry({ ...entry, category: 'Maintenance', createdBy: req.user.username });
  }

  @Post('expense')
  createExpense(@Body() entry: CreateExpenseDto, @Req() req: AuthenticatedRequest) {
    const type = entry.type || 'General';
    return this.costingService.addEntry({ ...entry, type, details: `${entry.title} (${type})`, category: 'Expense', createdBy: req.user.username });
  }

  @Delete(':id')
  async deleteEntry(@Param('id') id: string) {
    if (!(await this.costingService.deleteEntry(id))) throw new NotFoundException('Cost entry not found');
    return { success: true };
  }

  @Put(':id')
  async updateEntry(@Param('id') id: string, @Body() entry: UpdateCostingEntryDto, @Req() req: AuthenticatedRequest) {
    const updated = await this.costingService.updateEntry(id, { ...entry, updatedBy: req.user.username });
    if (!updated) throw new NotFoundException('Cost entry not found');
    return updated;
  }
}
