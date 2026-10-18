import {
  CreateStaffDto,
  CreateShiftDto,
  CreatePayrollEntryDto,
  UpdatePayrollEntryDto,
} from './hr.dto';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { HrService } from './hr.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('staff')
  listStaff() {
    return this.hrService.listStaff();
  }

  @Post('staff')
  @Roles('MODIFIER')
  createStaff(@Body() body: CreateStaffDto) {
    return this.hrService.createStaff(body);
  }

  @Get('shifts')
  listShifts() {
    return this.hrService.listShifts();
  }

  @Post('shifts')
  @Roles('MODIFIER')
  createShift(@Body() body: CreateShiftDto) {
    return this.hrService.createShift(body);
  }

  @Get('payroll')
  listPayroll(@Query('month') month?: string) {
    return this.hrService.listPayroll(month);
  }

  @Post('payroll')
  @Roles('MODIFIER')
  createPayrollEntry(@Body() body: CreatePayrollEntryDto) {
    return this.hrService.createPayrollEntry(body);
  }

  @Put('payroll/:id')
  @Roles('MODIFIER')
  async updatePayrollEntry(@Param('id') id: string, @Body() body: UpdatePayrollEntryDto) {
    const updated = await this.hrService.updatePayrollEntry(id, body);
    if (!updated) throw new NotFoundException('Payroll entry not found');
    return updated;
  }

  @Delete('payroll/:id')
  @Roles('ADMIN')
  async deletePayrollEntry(@Param('id') id: string) {
    if (!(await this.hrService.deletePayrollEntry(id))) throw new NotFoundException('Payroll entry not found');
    return { success: true };
  }
}
