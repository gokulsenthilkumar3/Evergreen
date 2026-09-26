import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ORDERS = 10;

@Injectable()
export class PublicOrderRateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.ip || request.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (this.attempts.get(key) || []).filter(time => now - time < WINDOW_MS);
    if (recent.length >= MAX_ORDERS) {
      throw new HttpException('Too many orders. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.attempts.set(key, recent);
    if (this.attempts.size > 10_000) {
      for (const [address, times] of this.attempts) {
        if (times.every(time => now - time >= WINDOW_MS)) this.attempts.delete(address);
      }
    }
    return true;
  }
}
