import { ConnectorReadinessService } from './connector-readiness.service';
import { Param, ParseIntPipe } from '@nestjs/common';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { ImportInput } from '@evergreen/types';
import { Roles } from '../../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@Roles('ADMIN')
export class IntegrationsController {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly connectors: ConnectorReadinessService,
  ) {}
  @Post('imports/preview') preview(@Body() body: ImportInput) {
    return this.integrations.previewWithConflicts(body);
  }
  @Post('imports/commit') commit(
    @Body() body: ImportInput & { source: string; requestKey: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.integrations.commit(body, req.user.username);
  }
  @Get('status') status() {
    return this.connectors.status();
  }
  @Get('tally/connection') connection() {
    return this.connectors.tallyConnection();
  }
  @Get('eway-bill/readiness/:id') readiness(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.connectors.ewayReadiness(id);
  }
  @Get('imports') history() {
    return this.integrations.history();
  }
}
