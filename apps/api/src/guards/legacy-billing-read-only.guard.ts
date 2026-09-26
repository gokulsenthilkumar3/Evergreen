import { CanActivate, ExecutionContext, GoneException, Injectable } from '@nestjs/common';

@Injectable()
export class LegacyBillingReadOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const method = context.switchToHttp().getRequest().method;
    if (method === 'GET' || method === 'HEAD') return true;
    throw new GoneException('Legacy billing is read-only. Use Invoice Studio for invoices, payments and voids.');
  }
}
