import { Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  createProviderSession,
  PROVIDER_COOKIE,
  revokeProviderSession,
} from '../../guards/provider-session';
@ApiTags('Owner authentication')
@Controller('auth/provider/session')
export class ProviderSessionController {
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exchange the owner credential for an eight-hour HttpOnly session',
    description:
      'Supply the owner key in Authorization: Bearer. The browser never persists this key. Cookie is HttpOnly, SameSite=Strict and Secure in production. Restarting the API invalidates in-memory sessions.',
  })
  create(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = createProviderSession(process.env.ADMIN_API_KEY!.trim());
    res.cookie(PROVIDER_COOKIE, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: req.secure || process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 8 * 3600000,
    });
    res.setHeader('Cache-Control', 'no-store');
    return { authenticated: true, expiresInHours: 8 };
  }
  @Get()
  @ApiCookieAuth('provider-session')
  @ApiOperation({
    summary: 'Verify the current owner session or bearer credential',
  })
  status() {
    return { authenticated: true };
  }
  @Delete()
  @ApiCookieAuth('provider-session')
  @ApiOperation({
    summary: 'Revoke this owner session and clear its cookie',
    description:
      'Cookie-authenticated requests require an allowed Origin. Other owner sessions are unaffected.',
  })
  remove(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    revokeProviderSession(req.headers.cookie);
    res.clearCookie(PROVIDER_COOKIE, { path: '/' });
    return { authenticated: false };
  }
}
