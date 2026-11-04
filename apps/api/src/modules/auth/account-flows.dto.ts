import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class SendRecoveryDto { @IsEmail() email!: string; @IsOptional() @IsIn(['primary','secondary']) sender?: 'primary' | 'secondary'; }
export class RedeemAccountDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/) token!: string;
  @IsOptional() @IsString() @MinLength(12) @MaxLength(72) password?: string;
  @IsOptional() @IsString() @Matches(/^\d{6}$/) code?: string;
  @IsOptional() @IsString() @MaxLength(100) recoveryCode?: string;
}
export class InviteAccountDto {
  @IsString() @Matches(/^[A-Za-z0-9._@-]+$/) @MaxLength(100) username!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsIn(['ADMIN','MODIFIER','VIEWER']) role!: string;
  @IsOptional() @IsIn(['primary','secondary']) sender?: 'primary' | 'secondary';
}
export class EmailChangeDto extends SendRecoveryDto { @IsString() currentPassword!: string; }
export class GenerateRecoveryCodesDto { @IsString() currentPassword!: string; @IsOptional() @IsString() @Matches(/^\d{6}$/) code?: string; }
