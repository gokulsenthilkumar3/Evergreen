import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

const Trim = () => Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value);

export const LIFECYCLE_STAGES = ['LEAD', 'ONBOARDING', 'LIVE', 'AT_RISK', 'RENEWAL', 'CHURNED'] as const;
export const MILESTONE_STATUSES = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'] as const;
export const RISK_STATUSES = ['OPEN', 'MITIGATED', 'ACCEPTED', 'RESOLVED'] as const;
export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export class CreatePlanFromTemplateDto {
  @Trim()
  @IsString()
  @Length(1, 80)
  templateKey!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(4000)
  summary?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  nextReviewAt?: string;
}

export class UpdateCustomerPlanDto {
  @IsOptional()
  @IsIn(LIFECYCLE_STAGES)
  lifecycleStage?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(4000)
  summary?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  nextReviewAt?: string | null;
}

export class CreateMilestoneDto {
  @Trim()
  @IsString()
  @Length(1, 240)
  title!: string;

  @Trim()
  @IsString()
  @Length(1, 80)
  phase!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(160)
  owner?: string;

  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'])
  priority?: string;

  @IsOptional()
  @IsIn(MILESTONE_STATUSES)
  status?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dueAt?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2000)
  blocker?: string;
}

export class UpdateMilestoneDto extends CreateMilestoneDto {}

export class CreateRiskDto {
  @Trim()
  @IsString()
  @Length(1, 240)
  title!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(4000)
  details?: string;

  @IsOptional()
  @IsIn(SEVERITIES)
  severity?: string;

  @IsOptional()
  @IsIn(RISK_STATUSES)
  status?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(4000)
  mitigation?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dueAt?: string | null;
}

export class UpdateRiskDto extends CreateRiskDto {}

export class CreatePlanTemplateDto {
  @Trim()
  @IsString()
  @Length(1, 80)
  key!: string;

  @Trim()
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Trim()
  @IsString()
  @Length(1, 80)
  kind!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePlanTemplateDto extends CreatePlanTemplateDto {}

export class CreatePlanTemplateMilestoneDto {
  @Trim()
  @IsString()
  @Length(1, 240)
  title!: string;

  @Trim()
  @IsString()
  @Length(1, 80)
  phase!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  daysFromStart?: number;

  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'])
  priority?: string;
}
