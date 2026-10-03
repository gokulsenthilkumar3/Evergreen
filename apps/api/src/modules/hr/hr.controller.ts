import { Controller, Get, Post, Body, Query } from '@nestjs/common';
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
  createStaff(@Body() body: {
    employeeId: string;
    name: string;
    role: string;
    department?: string;
    phone?: string;
    joinDate?: string;
    salaryType?: string;
    dailyRate?: number;
    monthlySalary?: number;
  }) {
    return this.hrService.createStaff(body);
  }

  @Get('shifts')
  listShifts() {
    return this.hrService.listShifts();
  }

  @Post('shifts')
  @Roles('MODIFIER')
  createShift(@Body() body: { name: string; startTime: string; endTime: string }) {
    return this.hrService.createShift(body);
  }

  @Get('payroll')
  listPayroll(@Query('month') month?: string) {
    return this.hrService.listPayroll(month);
  }

  @Post('payroll')
  @Roles('MODIFIER')
  createPayrollEntry(@Body() body: {
    staffId: number;
    month: string;
    daysWorked: number;
    overtimeHrs?: number;
    basicPay: number;
    overtime?: number;
    deductions?: number;
    netPay: number;
  }) {
    return this.hrService.createPayrollEntry(body);
  }
}
