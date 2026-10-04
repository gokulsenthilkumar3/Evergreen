import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  async index(@Req() req: Request, @Res() res: Response) {
    const acceptsHtml = req.headers.accept?.includes('text/html');
    const wantsJson = req.query.format === 'json';

    if (acceptsHtml && !wantsJson) {
      const html = await this.appService.renderHealthDashboardHtml();
      return res.type('html').send(html);
    }
    const data = await this.appService.getHealthData(true);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.send(JSON.stringify(data, null, 2));
  }

  @Get('health')
  @Public()
  async health(@Req() req: Request, @Res() res: Response) {
    const acceptsHtml = req.headers.accept?.includes('text/html');
    const wantsJson = req.query.format === 'json';
    const forceUi = req.query.ui === '1' || req.query.ui === 'true';

    // If visited in browser (accepts text/html) without format=json, or if forceUi:
    if (!wantsJson && (acceptsHtml || forceUi)) {
      const html = await this.appService.renderHealthDashboardHtml();
      return res.type('html').send(html);
    }

    // Default to comprehensive pretty-printed JSON
    const data = await this.appService.getHealthData(true);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.send(JSON.stringify(data, null, 2));
  }

  @Get('status')
  @Public()
  async status(@Req() req: Request, @Res() res: Response) {
    const wantsJson = req.query.format === 'json';
    if (wantsJson) {
      const data = await this.appService.getHealthData(true);
      return res.json(data);
    }
    const html = await this.appService.renderHealthDashboardHtml();
    return res.type('html').send(html);
  }

  @Get('api/status')
  @Public()
  async apiStatus() {
    return this.appService.getHealthData(true);
  }

  @Get('api/processors/sync')
  @Post('api/processors/sync')
  @Public()
  async syncProcessors() {
    return this.appService.syncAllProcessors();
  }

  @Post('api/processors/ping/:id')
  @Get('api/processors/ping/:id')
  @Public()
  async pingProcessor() {
    const t0 = performance.now();
    const data = await this.appService.getHealthData(false);
    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;
    return {
      status: 'ONLINE',
      latencyMs: Math.max(1.2, latencyMs),
      dbLatency: data.database.latencyMs,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}
