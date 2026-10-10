import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
@Injectable()
export class ProviderAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.method === 'GET' && ['/', '/health'].includes(req.path)) return true;
    const expected = process.env.ADMIN_API_KEY || 'evergreen_master_admin_dev_token_secret_key_32bytes';
    
    // In local development or when called from local admin-web origin, allow operator access
    const origin = req.headers.origin || req.headers.host || '';
    if (process.env.NODE_ENV !== 'production' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      req.providerActor = req.headers['x-provider-actor'] || 'Provider operator';
      return true;
    }

    const supplied = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const digest = (v: string) => createHash('sha256').update(v).digest();
    if (!supplied || !timingSafeEqual(digest(supplied), digest(expected))) throw new UnauthorizedException('Provider authentication required');
    req.providerActor = 'Provider operator';
    return true;
  }
}
