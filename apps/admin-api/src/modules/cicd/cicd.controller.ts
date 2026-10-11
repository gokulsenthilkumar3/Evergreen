import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CicdService } from './cicd.service';
import { Public } from '../../decorators/public.decorator';

@Controller('cicd')
export class CicdController {
  constructor(private readonly cicdService: CicdService) {}

  @Get('releases')
  @Public()
  getPackages() {
    return this.cicdService.getPackages();
  }

  @Get('deployments')
  @Public()
  getDeployments() {
    return this.cicdService.getDeployments();
  }

  @Get('logs')
  @Public()
  getLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.cicdService.getLogs(limitNum);
  }

  @Post('build')
  @Public()
  triggerBuild(
    @Body()
    body: {
      version: string;
      name: string;
      changelog: string;
      targets?: string[];
    },
  ) {
    return this.cicdService.triggerBuild(body);
  }

  @Post('deploy')
  @Public()
  deployPackage(
    @Body()
    body: {
      packageVersion: string;
      companyId: string;
      strategy?: 'ROLLING' | 'BLUE_GREEN' | 'CANARY' | 'INSTANT';
    },
  ) {
    return this.cicdService.deployPackage(body);
  }
}
