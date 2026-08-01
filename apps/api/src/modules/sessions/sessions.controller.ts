import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AUTHOR')
export class SessionsController {
    constructor(private sessionsService: SessionsService) {}

    @Get()
    async getSessions() {
        return this.sessionsService.findAllSessions();
    }

    @Delete(':id/revoke')
    async revokeSession(@Param('id') id: string) {
        return this.sessionsService.revokeSession(id);
    }
}
