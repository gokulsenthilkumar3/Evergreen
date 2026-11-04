import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { PublicAuthRateLimitGuard } from '../../guards/public-order-rate-limit.guard';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
import { AccountFlowsService } from './account-flows.service';
import { EmailChangeDto, GenerateRecoveryCodesDto, InviteAccountDto, RedeemAccountDto, SendRecoveryDto } from './account-flows.dto';
@Controller('auth/account')
@Roles('VIEWER')
export class AccountFlowsController {
  constructor(private readonly flows: AccountFlowsService) {}
  @Get('senders') @Roles('ADMIN') senders() { return this.flows.senders(); }
  @Post('senders/:name/verify') @Roles('ADMIN') @UseGuards(PublicAuthRateLimitGuard) verifySender(@Param('name') name: string) { return this.flows.verifySender(name); }
  @Post('invitations') @Roles('ADMIN') invite(@Body() body: InviteAccountDto, @Req() req: AuthenticatedRequest) { return this.flows.invite(body, req.user.username); }
  @Get('invitations') @Roles('ADMIN') invitations() { return this.flows.invitations(); }
  @Delete('invitations/:id') @Roles('ADMIN') revoke(@Param('id') id: string, @Req() req: AuthenticatedRequest) { return this.flows.revokeInvitation(id, req.user.username); }
  @Public() @UseGuards(PublicAuthRateLimitGuard) @Post('request-reset') reset(@Body() body: SendRecoveryDto) { return this.flows.requestReset(body.email, body.sender); }
  @Public() @UseGuards(PublicAuthRateLimitGuard) @Post('onboarding') onboarding(@Body() body: RedeemAccountDto) { return this.flows.startOnboarding(body.token); }
  @Public() @UseGuards(PublicAuthRateLimitGuard) @Post('redeem') redeem(@Body() body: RedeemAccountDto) { return this.flows.redeem(body); }
  @Post('email-change') email(@Body() body: EmailChangeDto, @Req() req: AuthenticatedRequest) { return this.flows.requestEmailChange(req.user.userId, body.email, body.currentPassword, body.sender); }
  @Post('recovery-codes') codes(@Body() body: GenerateRecoveryCodesDto, @Req() req: AuthenticatedRequest) { return this.flows.recoveryCodes(req.user.userId, body.currentPassword, body.code); }
}
