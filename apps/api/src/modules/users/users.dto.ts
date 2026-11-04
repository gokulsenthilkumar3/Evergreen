import { PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^[A-Za-z0-9._@-]+$/)
  @MaxLength(100)
  username!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(200)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['VIEWER', 'MODIFIER', 'ADMIN'])
  role?: 'VIEWER' | 'MODIFIER' | 'ADMIN';
}

export class UpdateUserDto extends PartialType(CreateUserDto, {
  skipNullProperties: false,
}) {}

export class RevokeUserSessionsDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  @Matches(/\S.{3,}\S/)
  reason!: string;
}

export class UserStatusDto {
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'DELETED'])
  status!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;
}
