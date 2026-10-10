import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { ImportInput } from '@evergreen/types';
import { Roles } from '../../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@Roles('ADMIN')
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}
  @Post('imports/preview') preview(@Body() body: ImportInput) { return this.integrations.preview(body); }
  @Post('imports/commit') commit(@Body() body: ImportInput & { source: string; requestKey: string }, @Req() req: AuthenticatedRequest) { return this.integrations.commit(body, req.user.username); }
  @Get('imports') history() { return this.integrations.history(); }
}
