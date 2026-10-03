import { IsBoolean, IsIn, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

const supplied = (_: unknown, value: unknown) => value !== undefined;

export class UpdateSettingsDto {
  @ValidateIf(supplied) @IsString() @MaxLength(200)
  companyName?: string;
  @ValidateIf(supplied) @IsString() @MaxLength(2000)
  address?: string;
  @ValidateIf(supplied) @Matches(/^(?:[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])?$/)
  gstin?: string;
  @ValidateIf(supplied) @IsString() @MaxLength(30)
  phone?: string;
  @ValidateIf(supplied) @Matches(/^(?:[^\s@]+@[^\s@]+\.[^\s@]+)?$/) @MaxLength(254)
  email?: string;
  @ValidateIf(supplied) @IsString() @MaxLength(700000)
  logo?: string;
  @ValidateIf(supplied) @IsBoolean()
  autoBackup?: boolean;
  @ValidateIf(supplied) @IsBoolean()
  emailNotifications?: boolean;
  @ValidateIf(supplied) @IsBoolean()
  lowStockAlert?: boolean;
  @ValidateIf(supplied) @IsIn(['CLASSIC', 'MODERN', 'MINIMAL'])
  defaultInvoiceTheme?: string;
  @ValidateIf(supplied) @Matches(/^\d+(?:\.\d+)?$/) @MaxLength(20)
  lowStockThreshold?: string;
  @ValidateIf(supplied) @Matches(/^\d+(?:\.\d+)?$/) @MaxLength(20)
  maintenanceRate?: string;
  @ValidateIf(supplied) @Matches(/^\d+(?:\.\d+)?$/) @MaxLength(20)
  ebRate?: string;
  @ValidateIf(supplied) @Matches(/^\d+(?:\.\d+)?$/) @MaxLength(20)
  packageRate?: string;
  @ValidateIf(supplied) @Matches(/^\d+(?:\.\d+)?$/) @MaxLength(20)
  gstPercent?: string;
  @ValidateIf(supplied) @IsIn(['en', 'ta'])
  language?: string;
  @ValidateIf(supplied) @IsString() @MaxLength(100)
  sellerState?: string;
  @ValidateIf(supplied) @IsString() @MaxLength(200)
  supportedCounts?: string;
}
