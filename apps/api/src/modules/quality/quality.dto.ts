import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';

export class CreateQualityInspectionDto {
  @IsOptional() @IsInt() @Min(1)
  lotId?: number;
  @IsOptional() @IsNumber() @Min(0.000001)
  holdQuantity?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  productionId?: number;
  @IsOptional()
  @IsString()
  batchId?: string;
  @IsOptional()
  @IsString()
  yarnCount?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  sampleWeight?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  tenacity?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  elongation?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  imperfections?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  classimateFaults?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  unevenness?: number;
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'PASS', 'FAIL', 'HOLD'])
  status?: string;
  @IsOptional()
  @IsString()
  @IsIn(['RELEASE', 'REPROCESS', 'SCRAP'])
  disposition?: string;
  @IsOptional()
  @IsString()
  remarks?: string;
  @IsOptional()
  @IsString()
  inspectedBy?: string;
}
