import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';

/**
 * Public edge lookup used by a reverse proxy or SaaS ingress. It deliberately
 * returns routing metadata only; provider credentials and company API keys are
 * never exposed here.
 */
@Controller('public/tenant')
export class TenantRoutingController {
  constructor(private readonly companies: CompaniesService) {}

  @Get('resolve')
  async resolve(@Query('host') host?: string) {
    if (!host?.trim()) return { matched: false, reason: 'host_required' };
    const result = await this.companies.resolveDomain(host);
    if (!result) throw new NotFoundException('No active customer is registered for this hostname');
    return { matched: true, ...result };
  }
}
