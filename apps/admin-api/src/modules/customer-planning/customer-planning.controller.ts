import { Body, Controller, Get, Param, Patch, Post, Query, Req, ParseUUIDPipe } from '@nestjs/common';
import type { Request } from 'express';
import { CustomerPlanningService } from './customer-planning.service';
import {
  CreateMilestoneDto,
  CreatePlanFromTemplateDto,
  CreatePlanTemplateDto,
  CreatePlanTemplateMilestoneDto,
  CreateRiskDto,
  UpdateCustomerPlanDto,
  UpdateMilestoneDto,
  UpdatePlanTemplateDto,
  UpdateRiskDto,
} from './customer-planning.dto';

@Controller('customer-planning')
export class CustomerPlanningController {
  constructor(private readonly planning: CustomerPlanningService) {}

  private actor(request: Request & { providerActor?: string }) { return request.providerActor || 'Provider operator'; }

  @Get('accounts') listAccounts() { return this.planning.listAccounts(); }
  @Get('templates') templates() { return this.planning.templates(); }
  @Post('templates') createTemplate(@Body() body: CreatePlanTemplateDto) { return this.planning.createTemplate(body); }
  @Patch('templates/:id') updateTemplate(@Param('id') id: string, @Body() body: UpdatePlanTemplateDto) { return this.planning.updateTemplate(id, body); }
  @Post('templates/:id/milestones') addTemplateMilestone(@Param('id') id: string, @Body() body: CreatePlanTemplateMilestoneDto) { return this.planning.addTemplateMilestone(id, body); }

  @Get('alerts') alerts(@Query('companyId') companyId?: string, @Query('status') status?: string) { return this.planning.alerts(companyId, status); }
  @Post('alerts/:id/acknowledge') acknowledge(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: Request & { providerActor?: string }) { return this.planning.updateAlert(id, 'ACKNOWLEDGE', this.actor(request)); }
  @Post('alerts/:id/resolve') resolve(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: Request & { providerActor?: string }) { return this.planning.updateAlert(id, 'RESOLVE', this.actor(request)); }

  @Get('accounts/:companyId/plan') getPlan(@Param('companyId', new ParseUUIDPipe()) companyId: string) { return this.planning.getPlan(companyId); }
  @Post('accounts/:companyId/plan/from-template') createFromTemplate(@Param('companyId', new ParseUUIDPipe()) companyId: string, @Body() body: CreatePlanFromTemplateDto, @Req() request: Request & { providerActor?: string }) { return this.planning.createFromTemplate(companyId, body, this.actor(request)); }
  @Patch('accounts/:companyId/plan') updatePlan(@Param('companyId', new ParseUUIDPipe()) companyId: string, @Body() body: UpdateCustomerPlanDto, @Req() request: Request & { providerActor?: string }) { return this.planning.updatePlan(companyId, body, this.actor(request)); }
  @Post('accounts/:companyId/plan/refresh') refresh(@Param('companyId', new ParseUUIDPipe()) companyId: string) { return this.planning.refreshCompany(companyId); }

  @Post('accounts/:companyId/milestones') addMilestone(@Param('companyId', new ParseUUIDPipe()) companyId: string, @Body() body: CreateMilestoneDto, @Req() request: Request & { providerActor?: string }) { return this.planning.addMilestone(companyId, body, this.actor(request)); }
  @Patch('accounts/:companyId/milestones/:id') updateMilestone(@Param('companyId', new ParseUUIDPipe()) companyId: string, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateMilestoneDto, @Req() request: Request & { providerActor?: string }) { return this.planning.updateMilestone(companyId, id, body, this.actor(request)); }
  @Post('accounts/:companyId/risks') addRisk(@Param('companyId', new ParseUUIDPipe()) companyId: string, @Body() body: CreateRiskDto, @Req() request: Request & { providerActor?: string }) { return this.planning.addRisk(companyId, body, this.actor(request)); }
  @Patch('accounts/:companyId/risks/:id') updateRisk(@Param('companyId', new ParseUUIDPipe()) companyId: string, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateRiskDto, @Req() request: Request & { providerActor?: string }) { return this.planning.updateRisk(companyId, id, body, this.actor(request)); }
}
