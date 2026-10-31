import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { validateProviderSession } from './provider-session';

@Injectable()
export class ProviderAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { providerActor?: string }>();
    if (req.method === 'POST' && req.path === '/licensing/lease') return true; // Device-proof authentication is enforced by the lease endpoint.
    // Allow public health and root status probes
    if (
      req.method === 'GET' &&
      ['/', '/health', '/license/status', '/public/marketing-settings'].includes(req.path)
    ) {
      return true;
    }

    const expected = process.env.ADMIN_API_KEY?.trim();
    if (
      !expected ||
      expected.length < 32 ||
      /^(evergreen_master_admin_dev_token|provider_master_key|eg_provider_operator_key_32bytes_secret_token|change_in_production|REPLACE_WITH)/i.test(
        expected,
      )
    ) {
      throw new UnauthorizedException(
        'ADMIN_API_KEY must be configured before provider access is enabled',
      );
    }

    if (
      !req.headers.authorization &&
      !req.headers['x-provider-key'] &&
      validateProviderSession(req.headers.cookie, expected)
    ) {
      const origin = req.headers.origin;
      const allowed = (
        process.env.ADMIN_CORS_ORIGIN ||
        'http://localhost:5173,http://localhost:5174'
      )
        .split(',')
        .map((value) => value.trim());
      if (
        (origin && !allowed.includes(origin)) ||
        (!['GET', 'HEAD'].includes(req.method) && !origin)
      )
        throw new UnauthorizedException(
          'Provider session origin is not authorized',
        );
      req.providerActor =
        process.env.ADMIN_API_ACTOR?.trim() || 'Provider operator';
      return true;
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
      throw new UnauthorizedException(
        'Provider authentication credentials required',
      );
    }

    // Constant-time hash comparison to prevent timing attacks
    const digest = (v: string) => createHash('sha256').update(v).digest();
    const suppliedDigest = digest(supplied);
    const expectedDigest = digest(expected);

    if (!timingSafeEqual(suppliedDigest, expectedDigest)) {
      throw new UnauthorizedException(
        'Invalid provider authentication credentials',
      );
    }

    // Actor identity is server-owned. A caller-controlled header is not an
    // auditable identity and must never overwrite the authenticated principal.
    req.providerActor =
      process.env.ADMIN_API_ACTOR?.trim() || 'Provider operator';
    return true;
  }
}
