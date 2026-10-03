import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsDateString,
  Matches,
  IsIn,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  @IsNotEmpty()
  role!: string;
  @IsOptional()
  @IsString()
  department?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsDateString()
  joinDate?: string;
  @IsOptional()
  @IsString()
  @IsIn(['DAILY', 'MONTHLY'])
  salaryType?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlySalary?: number;
}

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;
}

export class CreatePayrollEntryDto {
  @IsInt()
  @Min(1)
  staffId!: number;
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  month!: string;
  @IsNumber()
  @Min(0)
  @Max(31)
  daysWorked!: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeHrs?: number;
  @IsNumber()
  @Min(0)
  basicPay!: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtime?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;
  @IsNumber()
  @Min(0)
  netPay!: number;
}
