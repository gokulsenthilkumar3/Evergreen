import {
  CreateStaffDto,
  CreateShiftDto,
  CreatePayrollEntryDto,
} from './hr.dto';
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
}
