import { Controller, Post, Body, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebAuthnService } from './webauthn.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private webAuthnService: WebAuthnService
    ) { }

    @Post('signup')
    async signup(@Body() signupDto: any) {
        if (!signupDto.username || !signupDto.password || !signupDto.email) {
            throw new UnauthorizedException('Missing required fields');
        }
        return this.authService.signup(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: any, @Req() req: Request) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const ip = req.ip || req.socket.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        return this.authService.login(user, { ip, userAgent }, loginDto.totpCode);
    }

    @UseGuards(JwtAuthGuard)
    @Get('totp/generate')
    async generateTotp(@Req() req: any) {
        return this.authService.generateTotpSecret(req.user.userId, req.user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Post('totp/verify')
    async verifyTotp(@Req() req: any, @Body('code') code: string) {
        return this.authService.verifyAndEnableTotp(req.user.userId, code);
    }

    @UseGuards(JwtAuthGuard)
    @Post('totp/disable')
    async disableTotp(@Req() req: any) {
        return this.authService.disableTotp(req.user.userId);
    }

    // WebAuthn Passkeys Endpoints

    @UseGuards(JwtAuthGuard)
    @Get('passkey/register-options')
    async generatePasskeyRegistrationOptions(@Req() req: any) {
        return this.webAuthnService.getRegistrationOptions(req.user.userId, req.user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Post('passkey/register-verify')
    async verifyPasskeyRegistration(@Req() req: any, @Body() body: any) {
        return this.webAuthnService.verifyRegistration(req.user.userId, body);
    }

    @Post('passkey/auth-options')
    async generatePasskeyAuthenticationOptions(@Body('username') username: string) {
        return this.webAuthnService.getAuthenticationOptions(username);
    }

    @Post('passkey/auth-verify')
    async verifyPasskeyAuthentication(@Body() body: any, @Req() req: Request) {
        const { username, response } = body;
        const result = await this.webAuthnService.verifyAuthentication(username, response);
        if (result.verified) {
            const ip = req.ip || req.socket.remoteAddress || 'Unknown';
            const userAgent = req.headers['user-agent'] || 'Unknown';
            // Assuming no TOTP for passkey login, or we can prompt for it
            return this.authService.login(result.user, { ip, userAgent });
        }
        throw new UnauthorizedException('Passkey verification failed');
    }
}
