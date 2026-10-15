import { plainToInstance } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

// The provider sync endpoint returns a complete license snapshot. Missing fields
// must not fall back to local values and accidentally reactivate a suspension.
class AdminSyncResponseDto {
  @Equals(true)
  success!: true;

  @IsIn(['SEED', 'GROWTH', 'SCALE', 'ENTERPRISE', 'GATEKEEPER'])
  plan!: string;

  @IsIn(['TRIAL', 'TIERED', 'PAYG', 'PER_SPINDLE', 'FLAT_ENTERPRISE'])
  pricingModel!: string;

  @IsIn(['ACTIVE', 'GRACE_PERIOD', 'SUSPENDED'])
  status!: 'ACTIVE' | 'GRACE_PERIOD' | 'SUSPENDED';

  @IsIn(['TIER_1_CITY', 'TIER_2_CITY', 'TIER_3_CITY', 'RURAL', 'INTERNATIONAL'])
  tier!: string;

  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  maxUsers!: number;

  @IsInt()
  @Min(0)
  @Max(2_147_483_647)
  maxMachines!: number;

  @IsInt()
  @Min(0)
  @Max(2_147_483_647)
  maxDocsPerMonth!: number;

  @IsString()
  @MaxLength(256)
  @Matches(
    /^(?:CORE|INVENTORY|COMMERCE|MACHINES|QUALITY|HR|JOBWORK)(?:,(?:CORE|INVENTORY|COMMERCE|MACHINES|QUALITY|HR|JOBWORK))*$/,
  )
  allowedModules!: string;

  @IsBoolean()
  isMaintenance!: boolean;

  @ValidateIf((_object, value) => value !== null)
  @IsISO8601({ strict: true, strictSeparator: true })
  expiresAt!: string | null;

  @IsInt()
  @Min(0)
  @Max(365)
  gracePeriodDays!: number;
}

export function parseAdminSyncResponse(payload: unknown): AdminSyncResponseDto {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid provider license response');
  }

  const response = plainToInstance(AdminSyncResponseDto, payload);
  if (
    validateSync(response, { whitelist: true }).length > 0 ||
    (response.expiresAt !== null &&
      !Number.isFinite(new Date(response.expiresAt).getTime()))
  ) {
    // Do not put provider response values (which may contain secrets) in logs.
    throw new Error('Invalid provider license response');
  }
  return response;
}
