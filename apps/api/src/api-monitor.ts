import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const startedAt = new Date().toISOString();
const counters = new Map<string, { requests: number; errors: number; totalMs: number; lastSeen: string; lastStatus: number }>();
export function observeApi(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  res.once('finish', () => {
    // Route templates exclude customer identifiers, queries and request bodies.
    if (!req.route?.path || req.path === '/internal/api-monitor') return;
    const key = `${req.method} ${req.baseUrl || ''}${req.route.path}`;
    if (!counters.has(key) && counters.size >= 2000) return;
    const item = counters.get(key) || { requests: 0, errors: 0, totalMs: 0, lastSeen: '', lastStatus: 0 };
    item.requests++; item.errors += res.statusCode >= 400 ? 1 : 0;
    item.totalMs += performance.now() - start; item.lastSeen = new Date().toISOString(); item.lastStatus = res.statusCode;
    counters.set(key, item);
  });
  next();
}
export function serveMonitor(document: { paths?: Record<string, any> }) {
  return (req: Request, res: Response) => {
    const expected = process.env.EVERGREEN_MONITOR_TOKEN || '';
    const supplied = req.headers.authorization?.replace(/^Bearer /, '') || '';
    if (expected.length < 32 || supplied.length > 512 || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
      res.status(403).json({ message: 'Monitoring access denied' }); return;
    }
    const actions = Object.entries(document.paths || {}).flatMap(([path, methods]) => Object.entries(methods).filter(([method]) => ['get','post','put','patch','delete','head','options'].includes(method)).map(([method, operation]: [string, any]) => {
      const stats = counters.get(`${method.toUpperCase()} ${path}`);
      return { method: method.toUpperCase(), path, group: operation.tags?.[0] || 'Other', summary: operation.summary || operation.operationId || path, requests: stats?.requests || 0, errors: stats?.errors || 0, averageMs: stats ? Math.round(stats.totalMs / stats.requests) : null, lastSeen: stats?.lastSeen || null, lastStatus: stats?.lastStatus || null };
    }));
    res.setHeader('Cache-Control', 'no-store');
    res.json({ startedAt, checkedAt: new Date().toISOString(), actions });
  };
}
