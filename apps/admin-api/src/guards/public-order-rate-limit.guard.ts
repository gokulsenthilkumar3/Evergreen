import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const WINDOW_MS = 15 * 60 * 1000;

class SlidingWindowLimit {
  private readonly attempts = new Map<string, number[]>();

  check(key: string, maxAttempts: number, message: string): boolean {
    const now = Date.now();
    const recent = (this.attempts.get(key) || []).filter(
      (time) => now - time < WINDOW_MS,
    );
    if (recent.length >= maxAttempts) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.attempts.set(key, recent);
    if (this.attempts.size > 10_000) {
      for (const [address, times] of this.attempts) {
        if (times.every((time) => now - time >= WINDOW_MS))
          this.attempts.delete(address);
      }
    }
    return true;
  }
}

const clientIp = (context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.ip || request.socket?.remoteAddress || 'unknown';
};

// Nest may instantiate a method-scoped guard for each authentication route.
// Keep one budget across password and passkey entry points in this process.
const publicAuthLimit = new SlidingWindowLimit();

@Injectable()
export class PublicOrderRateLimitGuard implements CanActivate {
  private readonly limit = new SlidingWindowLimit();

  canActivate(context: ExecutionContext): boolean {
    return this.limit.check(
      clientIp(context),
      10,
      'Too many orders. Please try again later.',
    );
  }
}

@Injectable()
export class PublicAuthRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return publicAuthLimit.check(
      clientIp(context),
      20,
      'Too many login attempts. Please try again later.',
    );
  }
}
