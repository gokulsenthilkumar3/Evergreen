import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { EmailService } from './email.service';
import { WebAuthnService } from './webauthn.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret-key',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AuthService, JwtStrategy, EmailService, WebAuthnService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
