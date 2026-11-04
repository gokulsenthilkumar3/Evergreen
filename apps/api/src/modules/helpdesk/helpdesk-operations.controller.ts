import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../../decorators/roles.decorator';
import { HelpdeskRateLimitGuard } from '../../guards/public-order-rate-limit.guard';
import type { HelpdeskActor } from './helpdesk.dto';
import {
  ArticleFeedbackDto,
  BulkTicketDto,
  ImportTicketsDto,
  MergeTicketDto,
  SaveSupportResourceDto,
  SplitTicketDto,
  TicketMetadataDto,
  TicketPageDto,
  TicketCsatDto,
  TicketAttachmentDto,
  TicketAcknowledgementDto,
  DispatchTicketEmailDto,
  TicketReplyRevisionDto,
  TicketWorkDto,
  TicketAiDto,
} from './helpdesk-operations.dto';
import { HelpdeskOperationsService } from './helpdesk-operations.service';
@Controller('helpdesk')
@Roles('VIEWER')
export class HelpdeskOperationsController {
  @Get('tickets/:id/ai-preview') @Roles('ADMIN') aiPreview(@Param('id') id:string,@Query('includeInternal') includeInternal:string,@Req() req:{user:HelpdeskActor}){return this.service.aiPreview(id,req.user,includeInternal==='true');}
  @Post('tickets/:id/ai') @Roles('ADMIN') @UseGuards(HelpdeskRateLimitGuard) ai(@Param('id') id:string,@Body() body:TicketAiDto,@Req() req:{user:HelpdeskActor}){return this.service.aiAssist(id,body,req.user);}
  @Get('capabilities') @Roles('ADMIN') capabilities(
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.capabilities(req.user);
  }
  @Get('tickets/:id/presence') @Roles('ADMIN') presence(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.presence(id, req.user);
  }
  @Post('tickets/:id/presence') @Roles('ADMIN') presenceBeat(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.presence(id, req.user, true);
  }
  @Get('link-candidates') @Roles('ADMIN') links(
    @Query('type') type: string,
    @Query('q') q: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.linkCandidates(type, q || '', req.user);
  }
  constructor(private readonly service: HelpdeskOperationsService) {}
  @Post('tickets/:id/messages/:eventId/revisions') revise(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Body() body: TicketReplyRevisionDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.reviseReply(id, eventId, body, req.user);
  }
  @Post('tickets/:id/work') @Roles('ADMIN') work(
    @Param('id') id: string,
    @Body() body: TicketWorkDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.work(id, body, req.user);
  }
  @Post('notifications/read-all') readAll(@Req() req: { user: HelpdeskActor }) {
    return this.service.notificationsReadAll(req.user);
  }
  @Get('tickets/:id/email-preview') @Roles('ADMIN') emailPreview(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.emailPreview(id, req.user);
  }
  @Post('tickets/:id/email-dispatch')
  @Roles('ADMIN')
  @UseGuards(HelpdeskRateLimitGuard)
  dispatch(
    @Param('id') id: string,
    @Body() body: DispatchTicketEmailDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.dispatchEmail(id, body, req.user);
  }
  @Get('queue') page(
    @Query() query: TicketPageDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.page(query, req.user);
  }
  @Get('resources/:kind') resources(
    @Param('kind') kind: string,
    @Query('q') q: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.resourceList(kind, req.user, q || '');
  }
  @Post('resources') @UseGuards(HelpdeskRateLimitGuard) save(
    @Body() body: SaveSupportResourceDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.saveResource(body, req.user);
  }
  @Get('resources/:id/revisions') revisions(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.revisions(id, req.user);
  }
  @Post('kb/:id/feedback') @UseGuards(HelpdeskRateLimitGuard) articleFeedback(
    @Param('id') id: string,
    @Body() body: ArticleFeedbackDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.articleFeedback(id, body.helpful, req.user);
  }
  @Get('queues') @Roles('ADMIN') queues(@Req() req: { user: HelpdeskActor }) {
    return this.service.queues(req.user);
  }
  @Get('reporting') @Roles('ADMIN') reporting(
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.reporting(req.user);
  }
  @Post('tickets/:id/metadata') @Roles('ADMIN') metadata(
    @Param('id') id: string,
    @Body() body: TicketMetadataDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.metadata(id, body, req.user);
  }
  @Post('bulk') @Roles('ADMIN') bulk(
    @Body() body: BulkTicketDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.bulk(body, req.user);
  }
  @Post('tickets/:id/merge') @Roles('ADMIN') merge(
    @Param('id') id: string,
    @Body() body: MergeTicketDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.merge(id, body, req.user);
  }
  @Post('tickets/:id/split') @Roles('ADMIN') split(
    @Param('id') id: string,
    @Body() body: SplitTicketDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.split(id, body, req.user);
  }
  @Post('tickets/:id/csat') csat(
    @Param('id') id: string,
    @Body() body: TicketCsatDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.csat(id, body, req.user);
  }
  @Post('tickets/:id/acknowledge') acknowledge(
    @Param('id') id: string,
    @Body() body: TicketAcknowledgementDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.acknowledge(id, body, req.user);
  }
  @Post('tickets/:id/attachments') @UseGuards(HelpdeskRateLimitGuard) upload(
    @Param('id') id: string,
    @Body() body: TicketAttachmentDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.upload(id, body, req.user);
  }
  @Get('tickets/:id/attachments/:attachmentId') async download(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: { user: HelpdeskActor },
    @Res() res: Response,
  ) {
    const file = await this.service.download(id, attachmentId, req.user);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename.replace(/[^a-zA-Z0-9._ -]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(file.bytes);
  }
  @Post('notifications/:id/read') read(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.notificationsRead(id, req.user);
  }
  @Get('tickets/:id/export') async export(
    @Param('id') id: string,
    @Req() req: { user: HelpdeskActor },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="support-ticket.json"',
    );
    return this.service.exportTicket(id, req.user);
  }
  @Post('import') @Roles('ADMIN') @UseGuards(HelpdeskRateLimitGuard) import(
    @Body() body: ImportTicketsDto,
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.importTickets(body, req.user);
  }
  @Get('retention-preview') @Roles('ADMIN') retention(
    @Req() req: { user: HelpdeskActor },
  ) {
    return this.service.retentionPreview(req.user);
  }
}
