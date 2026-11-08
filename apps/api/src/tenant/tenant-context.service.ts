import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export interface TenantContext {
  companyId: string | null;
  hostname: string;
  mode: 'isolated-installation';
}

@Injectable()
export class TenantContextService {
  private normalizeHostname(value: string) {
    return value.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
  }

  getCompanyId() {
    return process.env.COMPANY_ID?.trim() || null;
  }

  getContext(request: Request): TenantContext {
    const forwardedHost = request.headers['x-forwarded-host'];
    const rawHost = typeof forwardedHost === 'string'
      ? forwardedHost.split(',')[0]
      : request.headers.host || 'localhost';
    return {
      companyId: this.getCompanyId(),
      hostname: this.normalizeHostname(rawHost),
      mode: 'isolated-installation',
    };
  }

  assertAllowedHost(request: Request) {
    const configured = process.env.CUSTOMER_HOSTNAMES?.split(',')
      .map(value => this.normalizeHostname(value))
      .filter(Boolean) || [];
    if (!configured.length) return;
    const actual = this.getContext(request).hostname;
    if (!configured.includes(actual)) {
      throw new UnauthorizedException('This customer installation is not available on the requested hostname');
    }
  }
}
