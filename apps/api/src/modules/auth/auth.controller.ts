import { appendUserAudit } from '../../utils/user-audit';
import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Put,
  UseGuards,
  Req,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  TotpCodeDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './auth.dto';
import { WebAuthnService } from './webauthn.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PrismaService } from '../../services/prisma.service';
import type { Request } from 'express';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { PublicAuthRateLimitGuard } from '../../guards/public-order-rate-limit.guard';
import { GenerateRecoveryCodesDto } from './account-flows.dto';

@Controller('auth')
@Roles('VIEWER')
export class AuthController {
  constructor(
    private authService: AuthService,
    private webAuthnService: WebAuthnService,
    private prisma: PrismaService,
  ) {}

  @Post('signup')
  signup(): Promise<never> {
    // Staff accounts are created by authorized staff via /users only.
    return Promise.reject(
      new ForbiddenException('Public staff signup is disabled'),
    );
  }

  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    if (
      typeof loginDto?.username !== 'string' ||
      typeof loginDto?.password !== 'string'
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    return this.authService.login(user, { ip, userAgent }, loginDto.totpCode, loginDto.recoveryCode);
  }

  /**
   * Revokes the current session in the database (server-side logout).
   * The client is responsible for removing the token from storage after this call.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logout(@Req() req: any) {
    const sessionId = req.user?.sessionId;
    if (sessionId) {
      await this.prisma.$transaction(async tx => {
        await tx.session.updateMany({where:{id:sessionId,userId:req.user.userId},data:{isValid:false}});
        await appendUserAudit(tx,{data:{username:req.user.username,action:'LOGOUT',module:'AUTH',details:`User ${req.user.userId} signed out of the current session`}},req.user.userId);
      });
    }
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isTotpEnabled: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        sessions: {
          orderBy: { lastActive: 'desc' },
          take: 1,
          select: {
            id: true,
            ipAddress: true,
            location: true,
            device: true,
            userAgent: true,
            isValid: true,
            createdAt: true,
            lastActive: true,
          },
        },
      },
    });

    return user;
  }

  @UseGuards(JwtAuthGuard, PublicAuthRateLimitGuard)
  @Post('totp/generate')
  async generateTotp(@Req() req: any, @Body() body: GenerateRecoveryCodesDto) {
    await this.authService.assertOwnerProof(req.user.userId,body.currentPassword,body.code);
    return this.authService.generateTotpSecret(
      req.user.userId,
      req.user.username,
    );
  }

  @UseGuards(JwtAuthGuard, PublicAuthRateLimitGuard)
  @Post('totp/verify')
  async verifyTotp(@Req() req: any, @Body() body: TotpCodeDto) {
    return this.authService.verifyAndEnableTotp(req.user.userId, body.code, req.user.sessionId);
  }

  @UseGuards(JwtAuthGuard, PublicAuthRateLimitGuard)
  @Post('totp/disable')
  async disableTotp(@Req() req: any, @Body() body: GenerateRecoveryCodesDto) {
    await this.authService.assertOwnerProof(req.user.userId,body.currentPassword,body.code);
    return this.authService.disableTotp(req.user.userId, body.code || '', req.user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(
      req.user.userId,
      req.user.username,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.userId,
      req.user.username,
      body,
      req.user.sessionId,
    );
  }

  // WebAuthn Passkeys Endpoints

  @UseGuards(JwtAuthGuard)
  @Get('passkeys')
  async listPasskeys(@Req() req: any) {
    return this.prisma.webAuthnCredential.findMany({ where: { userId: req.user.userId }, select: { id: true, deviceType: true, backedUp: true, createdAt: true, lastUsed: true }, orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(JwtAuthGuard, PublicAuthRateLimitGuard)
  @Delete('passkeys/:id')
  async removePasskey(@Param('id') id: string, @Req() req: any, @Body() body: GenerateRecoveryCodesDto) {
    await this.authService.assertOwnerProof(req.user.userId,body.currentPassword,body.code);
    return this.prisma.$transaction(async tx => {
      const result = await tx.webAuthnCredential.deleteMany({ where: { id, userId: req.user.userId } });
      if (result.count === 0) throw new NotFoundException('Passkey not found');
      await appendUserAudit(tx, { data: { username: req.user.username, action: 'REMOVE_PASSKEY', module: 'AUTH', details: `Removed passkey from user ${req.user.userId}` } });
      return { removed: true };
    });
  }

  @UseGuards(JwtAuthGuard, PublicAuthRateLimitGuard)
  @Post('passkey/register-options')
  async generatePasskeyRegistrationOptions(@Req() req: any, @Body() body: GenerateRecoveryCodesDto) {
    await this.authService.assertOwnerProof(req.user.userId,body.currentPassword,body.code);
    return this.webAuthnService.getRegistrationOptions(
      req.user.userId,
      req.user.username,
    );
  }

  @UseGuards(JwtAuthGuard, PublicAuthRateLimitGuard)
  @Post('passkey/register-verify')
  async verifyPasskeyRegistration(@Req() req: any, @Body() body: any) {
    return this.webAuthnService.verifyRegistration(req.user.userId, body);
  }

  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @Post('passkey/auth-options')
  async generatePasskeyAuthenticationOptions(
    @Body('username') username: string,
  ) {
    return this.webAuthnService.getAuthenticationOptions(username);
  }

  @Public()
  @UseGuards(PublicAuthRateLimitGuard)
  @Post('passkey/auth-verify')
  async verifyPasskeyAuthentication(@Body() body: any, @Req() req: Request) {
    const { username, response } = body;
    const result = await this.webAuthnService.verifyAuthentication(
      username,
      response,
    );
    if (result.verified) {
      const ip = req.ip || req.socket.remoteAddress || 'Unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      return this.authService.login(result.user, { ip, userAgent }, undefined, undefined, true);
    }
    throw new UnauthorizedException('Passkey verification failed');
  }
}
