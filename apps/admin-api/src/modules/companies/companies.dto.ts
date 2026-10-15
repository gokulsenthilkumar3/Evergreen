import { Transform } from 'class-transformer';
import { BUSINESS_MODES, WORKSPACE_MODES } from '@evergreen/types';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

// Optional means omitted, not null. Null is accepted only for clearable dates.
const Optional = () => ValidateIf((_object, value) => value !== undefined);
const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
export const MAX_COUNTER = 2_147_483_647;

class LicenseFieldsDto {
  @Optional()
  @IsIn(['SEED', 'GROWTH', 'SCALE', 'ENTERPRISE', 'GATEKEEPER'])
  plan?: string;

  @Optional()
  @IsIn(['TRIAL', 'TIERED', 'PAYG', 'PER_SPINDLE', 'FLAT_ENTERPRISE'])
  pricingModel?: string;

  @Optional()
  @IsIn(['TIER_1_CITY', 'TIER_2_CITY', 'TIER_3_CITY', 'RURAL', 'INTERNATIONAL'])
  tier?: string;

  @Optional()
  @Trim()
  @IsString()
  @Length(1, 120)
  state?: string;

  @Optional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  country?: string;

  @Optional()
  @IsInt()
  @Min(1)
  @Max(MAX_COUNTER)
  maxUsers?: number;

  @Optional()
  @IsInt()
  @Min(0)
  @Max(MAX_COUNTER)
  maxMachines?: number;

  @Optional()
  @IsInt()
  @Min(0)
  @Max(MAX_COUNTER)
  maxDocsPerMonth?: number;

  @Optional()
  @IsInt()
  @Min(0)
  @Max(365)
  gracePeriodDays?: number;

  @Optional()
  @IsString()
  @MaxLength(256)
  @Matches(
    /^(?:CORE|INVENTORY|COMMERCE|MACHINES|QUALITY|HR|JOBWORK)(?:,(?:CORE|INVENTORY|COMMERCE|MACHINES|QUALITY|HR|JOBWORK))*$/,
  )
  allowedModules?: string;
}

export class CreateCompanyDto extends LicenseFieldsDto {
  @Trim()
  @IsString()
  @Length(1, 200)
  name!: string;

  @Optional()
  @IsIn(BUSINESS_MODES)
  businessMode?: string;

  @Optional()
  @IsIn(WORKSPACE_MODES)
  workspaceMode?: string;

  @Optional()
  @IsIn(['LOCAL_VM', 'GCP', 'AWS', 'AZURE'])
  cloudProvider?: string;

  @Optional()
  @IsString()
  @Length(1, 64)
  appVersion?: string;

  @Optional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
    disallow_auth: true,
  })
  deploymentUrl?: string;
}

export class UpdateLicenseDto extends LicenseFieldsDto {
  @Optional()
  @IsIn(['ACTIVE', 'GRACE_PERIOD', 'SUSPENDED'])
  status?: string;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsISO8601({ strict: true })
  expiresAt?: string | null;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsISO8601({ strict: true })
  graceExpiresAt?: string | null;

  @Optional()
  @IsBoolean()
  isMaintenance?: boolean;

  @Optional()
  @Trim()
  @IsString()
  @Length(1, 1000)
  details?: string;
}

class CompanyMetricsDto {
  @IsInt()
  @Min(0)
  @Max(MAX_COUNTER)
  totalInwards!: number;

  @IsInt()
  @Min(0)
  @Max(MAX_COUNTER)
  totalOutwards!: number;

  @IsInt()
  @Min(0)
  @Max(MAX_COUNTER)
  totalInvoices!: number;

  @IsInt()
  @Min(0)
  @Max(MAX_COUNTER)
  activeUsers!: number;
}

export class SyncCompanyDto extends CompanyMetricsDto {
  @Optional()
  @IsString()
  @Length(1, 64)
  appVersion?: string;
}

export class SyncCompanyV1Dto extends CompanyMetricsDto {
  @IsString()
  @Length(1, 64)
  appVersion!: string;
}

export class CompanyActionDto {
  @IsIn([
    'TOGGLE_MAINTENANCE',
    'TRIGGER_MIGRATION',
    'FORCE_SYNC',
    'REFRESH_LICENSE',
    'SYNC_TALLY',
    'RESTART_SERVICE',
  ])
  actionType!: string;

  @Optional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}
