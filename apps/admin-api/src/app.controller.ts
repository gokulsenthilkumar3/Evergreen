import { requireInstallationLicence } from '@evergreen/types/licensing';
import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('license/status')
  @Public()
  licenceStatus() {
    if (process.env.EVERGREEN_ADMIN_HOSTED === 'true') {
      return { active: true, mode: 'hosted', installationLicenceRequired: false };
    }
    try {
      requireInstallationLicence('provider');
      return { active: true };
    } catch {
      return { active: false };
    }
  }

  @Get()
  @Public()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getHello(): string {
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EverGreen Provider API</title>
<style>body{margin:0;background:#08111f;color:#e5eef8;font:16px system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:760px;margin:8vh auto;padding:32px}h1{margin:0 0 8px;font-size:32px}p{color:#9fb0c4}.card{margin-top:24px;padding:22px;border:1px solid #25415c;border-radius:16px;background:#0d1b2d}.ok{color:#55d99a;font-weight:700}.links{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}a{color:#8ed0ff;text-decoration:none;border:1px solid #315d7e;border-radius:10px;padding:10px 14px}small{color:#71869d}</style></head>
<body><main><h1>EverGreen Provider API</h1><p>Private owner control plane for customer and deployment management.</p>
<section class="card"><div class="ok">● API process is running</div><p>Hosted admin mode is active. Installation licensing is not required for this control plane.</p><small>Authentication is still required for protected operations.</small></section>
<div class="links"><a href="/health">Health JSON</a><a href="/api/docs">API documentation</a><a href="http://localhost:5174/">Open provider console</a></div>
</main></body></html>`;
  }

  @Get('health')
  @Public()
  async health() {
    return this.appService.getHealthData();
  }

  @Get('status')
  @Public()
  async status() {
    return this.appService.getHealthData();
  }
}
