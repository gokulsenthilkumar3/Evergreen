import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { JobWorkService } from './jobwork.service';

@Controller('job-work')
export class JobWorkController {
  constructor(private readonly jobs: JobWorkService) {}
  @Get('workers') workers() { return this.jobs.listWorkers(); }
  @Post('workers') worker(@Body() body: any) { return this.jobs.createWorker(body); }
  @Get() list() { return this.jobs.listChallans(); }
  @Get('summary') summary() { return this.jobs.summary(); }
  @Post('dispatch') dispatch(@Body() body: any, @Req() req: any) { return this.jobs.dispatch({ ...body, createdBy: req.user.username }); }
  @Post(':id/receive') receive(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) { return this.jobs.receive(id, { ...body, createdBy: req.user.username }); }
  @Post(':id/cancel') cancel(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) { return this.jobs.cancel(id, { ...body, createdBy: req.user.username }); }
}
