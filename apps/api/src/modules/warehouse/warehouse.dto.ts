import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsOptional()
  @IsString()
  zone?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class CreateMovementDto {
  @IsInt()
  @Min(1)
  locationId!: number;
  @IsInt()
  @Min(1)
  itemId!: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  toLocationId?: number;
  @IsNumber()
  @Min(0)
  @Min(0.000001)
  quantity!: number;
  @IsString()
  @IsNotEmpty()
  @IsIn(['IN', 'OUT', 'TRANSFER'])
  movementType!: string;
  @IsOptional()
  @IsString()
  referenceId?: string;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsString()
  createdBy?: string;
}
