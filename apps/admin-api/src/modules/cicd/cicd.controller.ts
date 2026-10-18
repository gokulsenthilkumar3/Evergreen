import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CicdService } from './cicd.service';
import { BuildReleaseDto, DeployReleaseDto } from './cicd.dto';
import type { Request } from 'express';

@Controller('cicd')
export class CicdController {
  constructor(private readonly cicdService: CicdService) {}

  @Get('releases')
  getPackages() {
    return this.cicdService.getPackages();
  }

  @Get('deployments')
  getDeployments() {
    return this.cicdService.getDeployments();
  }

  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.cicdService.getLogs(limitNum);
  }

  @Post('build')
  triggerBuild(
    @Body() body: BuildReleaseDto,
    @Req() request: Request & { providerActor?: string },
  ) {
    return this.cicdService.triggerBuild(body, request.providerActor);
  }

  @Post('deploy')
  deployPackage(
    @Body() body: DeployReleaseDto,
    @Req() request: Request & { providerActor?: string },
  ) {
    return this.cicdService.deployPackage(body, request.providerActor);
  }
}
