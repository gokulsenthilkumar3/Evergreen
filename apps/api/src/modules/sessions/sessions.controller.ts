import { Controller, Get, Delete, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VIEWER')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  async getSessions(@Req() request: Request & { user: any }) {
    return this.sessionsService.findSessionsForUser(request.user);
  }

  @Delete(':id/revoke')
  async revokeSession(@Param('id') id: string, @Req() request: Request & { user: any }) {
    return this.sessionsService.revokeSession(id, request.user);
  }
}
