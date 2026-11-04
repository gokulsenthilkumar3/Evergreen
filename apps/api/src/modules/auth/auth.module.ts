import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { EmailService } from './email.service';
import { WebAuthnService } from './webauthn.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { requireJwtSecret } from './jwt-secret';
import { AccountFlowsController } from './account-flows.controller';
import { AccountFlowsService } from './account-flows.service';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: requireJwtSecret(configService),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, EmailService, WebAuthnService, AccountFlowsService, OidcService],
  controllers: [AuthController, AccountFlowsController, OidcController],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
