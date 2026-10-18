import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class DeployReleaseDto {
  @Matches(/^v?\d+\.\d+\.\d+$/)
  packageVersion!: string;

  @IsUUID()
  companyId!: string;

  @IsUUID()
  requestKey!: string;

  @IsOptional()
  @IsIn(['MAINTENANCE'])
  strategy?: 'MAINTENANCE';
}

export class BuildReleaseDto {
  @Matches(/^v?\d+\.\d+\.\d+$/)
  version!: string;

  @IsUUID()
  requestKey!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(4000)
  changelog!: string;

  @IsOptional()
  @IsIn(['WINDOWS', 'DOCKER'], { each: true })
  targets?: string[];
}
