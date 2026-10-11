import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async createCompany(@Body() data: { name: string; plan?: string; businessMode?: string; workspaceMode?: string; cloudProvider?: string; appVersion?: string; deploymentUrl?: string }) {
    return this.companiesService.createCompany(data);
  }

  @Get()
  async getCompanies() {
    return this.companiesService.getCompanies();
  }

  @Get(':id')
  async getCompany(@Param('id') id: string) {
    return this.companiesService.getCompany(id);
  }

  // Endpoints that the individual company API will call to sync data
  // Standard fallback sync
  @Post(':id/sync')
  async syncCompanyData(
    @Param('id') id: string,
    @Body() metrics: { totalInwards: number; totalOutwards: number; totalInvoices: number; activeUsers: number; appVersion?: string }
  ) {
    return this.companiesService.updateMetrics(id, metrics);
  }

  // Explicit v1 strict sync
  @Post(':id/v1/sync')
  async syncCompanyDataV1(
    @Param('id') id: string,
    @Body() payload: { 
      totalInwards: number; 
      totalOutwards: number; 
      totalInvoices: number; 
      activeUsers: number; 
      appVersion: string;
      additionalMetrics?: any;
    }
  ) {
    return this.companiesService.updateMetrics(id, payload);
  }

  @Post(':id/license')
  async updateLicense(
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.companiesService.updateLicense(id, body);
  }

  @Post(':id/actions')
  async executeAction(
    @Param('id') id: string,
    @Body() body: { actionType: string; details?: string }
  ) {
    return this.companiesService.executeRemoteAction(id, body.actionType, body.details);
  }
}
