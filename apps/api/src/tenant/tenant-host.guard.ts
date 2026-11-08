import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantHostGuard implements CanActivate {
  constructor(private readonly tenant: TenantContextService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method === 'OPTIONS') return true;
    if (request.method === 'GET' && ['/','/health','/license/status','/tenant/context'].includes(request.path)) return true;
    this.tenant.assertAllowedHost(request);
    return true;
  }
}
