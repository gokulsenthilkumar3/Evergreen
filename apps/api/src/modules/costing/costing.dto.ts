import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Shared with the service-level checks: anything larger is a typing mistake.
export const MAX_COST_VALUE = 1_000_000_000;

// Totals for electricity, labour and packaging are worked out on the server
// from these inputs; the request never carries its own total for them.

export class CreateEbCostDto {
  @IsDateString()
  date!: string;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  unitsConsumed!: number;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  ratePerUnit!: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  noOfShifts?: number;
}

export class CreateEmployeeCostDto {
  @IsDateString()
  date!: string;
  @IsInt()
  @Min(1)
  @Max(100_000)
  workers!: number;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  rate!: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  noOfShifts?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  overtime?: number;
}

export class CreatePackagingCostDto {
  @IsDateString()
  date!: string;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  yarnProduced!: number;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  ratePerKg!: number;
}

export class CreateMaintenanceCostDto {
  @IsDateString()
  date!: string;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  totalCost!: number;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  ratePerKg?: number;
}

export class CreateExpenseDto {
  @IsDateString()
  date!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;
  @IsNumber()
  @IsPositive()
  @Max(MAX_COST_VALUE)
  amount!: number;
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

/** One route edits every category, so each field is optional; the stored category decides which apply. */
export class UpdateCostingEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  unitsConsumed?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  ratePerUnit?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  noOfShifts?: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  workers?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  rate?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  ratePerKg?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  yarnProduced?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  overtime?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_COST_VALUE)
  totalCost?: number;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
}
