import { requireInstallationLicence } from '@evergreen/types/licensing';
import { Controller, Get, Res, Logger, Header, Req } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { TenantContextService } from './tenant/tenant-context.service';
import type { Request } from 'express';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService, private readonly tenant: TenantContextService) {}

  @Get('tenant/context')
  @Public()
  context(@Req() request: Request) {
    return this.tenant.getContext(request);
  }

  @Get('license/status')
  @Public()
  licenceStatus() {
    try {
      requireInstallationLicence('tenant');
      return { active: true };
    } catch (error) {
      this.logger.warn(`Installation authorization unavailable: ${error instanceof Error ? error.message.slice(0,200) : 'unknown error'}`);
      return { active: false };
    }
  }

  @Get()
  @Public()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async index(@Res({ passthrough: true }) res: Response) {
    const health = await this.appService.getPublicHealth();
    const state = health.database ? '● API process is running' : '● API is running, database needs attention';
    const stateClass = health.database ? 'ok' : 'warn';
    if (!health.database) res.status(503);
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EverGreen Customer API</title>
<style>body{margin:0;background:#07151a;color:#e7f7f4;font:16px system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:760px;margin:8vh auto;padding:32px}h1{margin:0 0 8px;font-size:32px}p{color:#a3beb9}.card{margin-top:24px;padding:22px;border:1px solid #24554f;border-radius:16px;background:#0c2427}.ok{color:#61e1a9;font-weight:700}.warn{color:#ffd166;font-weight:700}.links{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}a{color:#91e4d4;text-decoration:none;border:1px solid #36776e;border-radius:10px;padding:10px 14px}small{color:#7fa49f}</style></head>
<body><main><h1>EverGreen Customer API</h1><p>Operational API for the customer workspace and business workflow.</p>
<section class="card"><div class="${stateClass}">${state}</div><p>Database: ${health.database ? 'connected' : 'unavailable'}</p><small>Use the health endpoint for machine-readable readiness checks.</small></section>
<div class="links"><a href="/health">Health JSON</a><a href="/api/docs">API documentation</a><a href="http://localhost:4000/">Open customer app</a></div>
</main></body></html>`;
  }

  /** Liveness and readiness probe. 503 when the database cannot be reached. */
  @Get('health')
  @Public()
  health(@Res({ passthrough: true }) res: Response) {
    return this.probe(res);
  }

  /** Record counts, stock totals and runtime details are operational data, not public. */
  @Get('status')
  @Roles('ADMIN')
  status() {
    return this.appService.getHealthData();
  }

  private async probe(res: Response) {
    const health = await this.appService.getPublicHealth();
    if (!health.database) res.status(503);
    return health;
  }
}
