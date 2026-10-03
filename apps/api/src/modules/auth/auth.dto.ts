import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  username!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  password!: string;
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  totpCode?: string;
}

export class TotpCodeDto {
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
