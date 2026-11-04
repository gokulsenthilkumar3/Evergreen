import { requireInstallationLicence } from '@evergreen/types/licensing';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('license/status')
  @Public()
  licenceStatus() {
    try {
      requireInstallationLicence('provider');
      return { active: true };
    } catch {
      return { active: false };
    }
  }

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
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
