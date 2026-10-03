import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  @IsNotEmpty()
  type!: string;
  @IsOptional()
  @IsString()
  serialNo?: string;
  @IsOptional()
  @IsString()
  manufacturer?: string;
  @IsOptional()
  @IsDateString()
  purchasedAt?: string;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class CreateMachineInspectionDto {
  @IsInt()
  @Min(1)
  machineId!: number;
  @IsString()
  @IsNotEmpty()
  type!: string;
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
  @IsOptional()
  @IsDateString()
  resolvedAt?: string;
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class MachineInspectionAtPathDto extends CreateMachineInspectionDto {
  @IsOptional()
  declare machineId: number;
}
