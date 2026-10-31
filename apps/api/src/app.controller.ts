import { requireInstallationLicence } from '@evergreen/types/licensing';
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('license/status')
  @Public()
  licenceStatus() {
    try {
      requireInstallationLicence('tenant');
      return { active: true };
    } catch {
      return { active: false };
    }
  }

  @Get()
  @Public()
  index(@Res({ passthrough: true }) res: Response) {
    return this.probe(res);
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
