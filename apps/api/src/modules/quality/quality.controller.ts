import { CreateQualityInspectionDto } from './quality.dto';
import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { QualityService } from './quality.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get('inspections')
  listInspections(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    return this.qualityService.listInspections({ from, to, status });
  }

  @Post('inspections')
  @Roles('MODIFIER')
  createInspection(@Body() body: CreateQualityInspectionDto, @Req() req: any) {
    return this.qualityService.createInspection({ ...body, inspectedBy: req.user.username });
  }
}
