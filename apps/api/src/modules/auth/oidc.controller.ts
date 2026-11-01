import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { PublicAuthRateLimitGuard } from '../../guards/public-order-rate-limit.guard';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
import { GenerateRecoveryCodesDto } from './account-flows.dto';
import { OidcService } from './oidc.service';
class FinishOidcDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/) ticket!: string;
  @IsOptional() @IsString() @Matches(/^\d{6}$/) code?: string;
  @IsOptional() @IsString() @MaxLength(100) recoveryCode?: string;
}
const cookie = (req: Request) => {
  const value = String(req.headers.cookie || '').split(';').map(part=>part.trim()).find(part=>part.startsWith('eg_oidc='));
  return value ? value.slice('eg_oidc='.length) : '';
};
@Controller('auth/oidc')
@Roles('VIEWER')
export class OidcController {
  constructor(private readonly oidc: OidcService) {}
  @Public() @Get('status') status() { return this.oidc.status(); }
  @Public() @UseGuards(PublicAuthRateLimitGuard) @Post('start')
  async start(@Res({ passthrough: true }) res: Response) {
    const result = await this.oidc.start();
    res.cookie('eg_oidc',result.cookie,{httpOnly:true,secure:result.secure,sameSite:'lax',path:'/',maxAge:600000});
    res.setHeader('Cache-Control','no-store');
    return { authorizationUrl: result.authorizationUrl };
  }
  @Post('link') async link(@Body() body: GenerateRecoveryCodesDto,@Req() req: AuthenticatedRequest,@Res({passthrough:true}) res: Response) {
    const result = await this.oidc.start({ userId:req.user.userId,sessionId:req.user.sessionId,password:body.currentPassword,code:body.code });
    res.cookie('eg_oidc',result.cookie,{httpOnly:true,secure:result.secure,sameSite:'lax',path:'/',maxAge:600000});
    res.setHeader('Cache-Control','no-store');
    return { authorizationUrl: result.authorizationUrl };
  }
  @Public() @UseGuards(PublicAuthRateLimitGuard) @Get('callback')
  async callback(@Req() req: Request,@Res() res: Response) {
    res.setHeader('Cache-Control','no-store'); res.setHeader('Referrer-Policy','no-referrer');
    try { return res.redirect(await this.oidc.callback(req.originalUrl.split('?').slice(1).join('?'),cookie(req))); }
    catch { throw new BadRequestException('SSO could not be completed. Check the provider setup and link your identity from Security Settings first.'); }
  }
  @Public() @UseGuards(PublicAuthRateLimitGuard) @Post('complete')
  async complete(@Body() body: FinishOidcDto,@Req() req: Request,@Res({passthrough:true}) res: Response) {
    res.setHeader('Cache-Control','no-store');
    const result = await this.oidc.complete(body.ticket,cookie(req),body.code,body.recoveryCode,req.ip,String(req.headers['user-agent']||''));
    res.clearCookie('eg_oidc',{path:'/'}); return result;
  }
  @Get('identities') identities(@Req() req: AuthenticatedRequest) { return this.oidc.identities(req.user.userId); }
  @Post('identities/:id/unlink') unlink(@Param('id') id:string,@Body() body: GenerateRecoveryCodesDto,@Req() req: AuthenticatedRequest) { return this.oidc.unlink(id,req.user.userId,body.currentPassword,body.code); }
}
