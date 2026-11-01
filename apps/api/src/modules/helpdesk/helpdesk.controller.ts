import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { HelpdeskRateLimitGuard } from '../../guards/public-order-rate-limit.guard';
import {
  AssignTicketDto,
  CreateTicketDto,
  TicketFeedbackDto,
  TicketMessageDto,
  UpdateTicketDto,
  type HelpdeskActor,
} from './helpdesk.dto';
import { HelpdeskService } from './helpdesk.service';
export { HelpdeskService } from './helpdesk.service';
export { CreateTicketDto, UpdateTicketDto } from './helpdesk.dto';
@ApiTags('Helpdesk')
@ApiBearerAuth()
@Controller('helpdesk')
@Roles('VIEWER')
export class HelpdeskController {
  constructor(private readonly service: HelpdeskService) {}
  @Get('tickets') list(@Req() req: { user: HelpdeskActor }) {
    return this.service.list(req.user);
  }
  @Post('tickets') @UseGuards(HelpdeskRateLimitGuard) create(
    @Body() body: CreateTicketDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.create(body, req.user);
  }
  @Get('agents') @Roles('ADMIN') agents(@Req() req: { user: HelpdeskActor }) {
    return this.service.agents(req.user);
  }
  @Get('tickets/:id') detail(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.detail(id, req.user);
  }
  @Patch('tickets/:id') @Roles('ADMIN') update(
    @Param('id') id: string,
    @Body() body: UpdateTicketDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.update(id, body, req.user);
  }
  @Post('tickets/:id/messages') @UseGuards(HelpdeskRateLimitGuard) message(
    @Param('id') id: string,
    @Body() body: TicketMessageDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.message(id, body, req.user);
  }
  @Post('tickets/:id/assign') @Roles('ADMIN') assign(
    @Param('id') id: string,
    @Body() body: AssignTicketDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.assign(id, body, req.user);
  }
  @Post('tickets/:id/confirm-fixed')
  @UseGuards(HelpdeskRateLimitGuard)
  feedback(
    @Param('id') id: string,
    @Body() body: TicketFeedbackDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.feedback(id, body, req.user);
  }
}
