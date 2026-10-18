import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { CompaniesService } from './companies.service';
import {
  CompanyActionDto,
  CreateCompanyDto,
  SyncCompanyDto,
  SyncCompanyV1Dto,
  UpdateLicenseDto,
} from './companies.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async createCompany(@Body() data: CreateCompanyDto) {
    return this.companiesService.createCompany(data);
  }

  @Get()
  async getCompanies() {
    return this.companiesService.getCompanies();
  }

  @Get(':id')
  async getCompany(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companiesService.getCompany(id);
  }

  // Endpoints that the individual company API will call to sync data
  // Standard fallback sync
  @Post(':id/sync')
  async syncCompanyData(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() metrics: SyncCompanyDto,
  ) {
    return this.companiesService.updateMetrics(id, metrics);
  }

  // Explicit v1 strict sync
  @Post(':id/v1/sync')
  async syncCompanyDataV1(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: SyncCompanyV1Dto,
  ) {
    return this.companiesService.updateMetrics(id, payload);
  }

  @Post(':id/license')
  async updateLicense(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateLicenseDto,
    @Req() request: Request & { providerActor?: string },
  ) {
    return this.companiesService.updateLicense(
      id,
      body,
      request.providerActor || 'Provider operator',
    );
  }

  @Post(':id/actions')
  async executeAction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: CompanyActionDto,
  ) {
    return this.companiesService.executeRemoteAction(
      id,
      body.actionType,
      body.details,
    );
  }
}
