import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}
  @Get() overview() { return this.service.overview(); }
  @Get('documents/:id') document(@Param('id', ParseIntPipe) id: number) { return this.service.document(id); }
  @Post('suppliers') supplier(@Body() body: any) { return this.service.supplier(body); }
  @Post('post/:kind') post(@Param('kind') kind: string, @Body() body: any, @Req() req: any) {
    if (['CUSTOMER_REFUND', 'CUSTOMER_UNALLOCATE', 'COST_CORRECTION', 'DISPATCH_RETURN', 'TRANSFORM_CANCEL'].includes(kind) && req.user.role !== 'ADMIN') throw new ForbiddenException('This reversal or refund requires an administrator');
    return this.service.post(kind, body, req.user.username);
  }
  @Post('holds/:id/release') release(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) { return this.service.releaseHold(id, body, req.user.username); }
  @Post('periods/close') @Roles('ADMIN') close(@Body() body: any, @Req() req: any) { return this.service.closePeriod(body, req.user.username); }
  @Post('orders/:id/amend') @Roles('ADMIN') amend(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) { return this.service.amendOrder(id, body, req.user.username); }
}
