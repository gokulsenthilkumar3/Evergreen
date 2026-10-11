import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';

@Injectable()
export class ProviderAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // Allow public health and root status probes
    if (req.method === 'GET' && ['/', '/health'].includes(req.path)) {
      return true;
    }

    const defaultDevKey = 'evergreen_master_admin_dev_token_secret_key_32bytes';
    const expected = process.env.ADMIN_API_KEY || defaultDevKey;

    // In production, reject if running with the default fallback development key
    if (process.env.NODE_ENV === 'production' && expected === defaultDevKey) {
      throw new UnauthorizedException('ADMIN_API_KEY environment variable must be configured in production');
    }

    // Extract credential from Authorization Bearer or X-Provider-Key header
    const authHeader = req.headers.authorization;
    let supplied = '';
    if (authHeader && typeof authHeader === 'string') {
      supplied = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.headers['x-provider-key']) {
      supplied = String(req.headers['x-provider-key']).trim();
    }

    if (!supplied) {
      throw new UnauthorizedException('Provider authentication credentials required');
    }

    // Constant-time hash comparison to prevent timing attacks
    const digest = (v: string) => createHash('sha256').update(v).digest();
    const suppliedDigest = digest(supplied);
    const expectedDigest = digest(expected);

    if (!timingSafeEqual(suppliedDigest, expectedDigest)) {
      throw new UnauthorizedException('Invalid provider authentication credentials');
    }

    req.providerActor = req.headers['x-provider-actor'] || 'Provider operator';
    return true;
  }
}
