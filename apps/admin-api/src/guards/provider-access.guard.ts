import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

@Injectable()
export class ProviderAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { providerActor?: string }>();
    // Allow public health and root status probes
    if (req.method === 'GET' && ['/', '/health'].includes(req.path)) {
      return true;
    }

    const expected = process.env.ADMIN_API_KEY?.trim();
    if (!expected || expected.length < 32 || /^(evergreen_master_admin_dev_token|provider_master_key|change_in_production|REPLACE_WITH)/i.test(expected)) {
      throw new UnauthorizedException('ADMIN_API_KEY must be configured before provider access is enabled');
    }

    // Extract credential from Authorization Bearer or X-Provider-Key header
    const authHeader = req.headers.authorization;
    let supplied = '';
    if (authHeader && typeof authHeader === 'string') {
      supplied = /^Bearer\s+(\S+)$/i.exec(authHeader)?.[1] || '';
    } else if (typeof req.headers['x-provider-key'] === 'string') {
      supplied = req.headers['x-provider-key'].trim();
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

    // Actor identity is server-owned. A caller-controlled header is not an
    // auditable identity and must never overwrite the authenticated principal.
    req.providerActor = process.env.ADMIN_API_ACTOR?.trim() || 'Provider operator';
    return true;
  }
}
