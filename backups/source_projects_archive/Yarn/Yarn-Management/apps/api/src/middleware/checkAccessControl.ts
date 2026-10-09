import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

/**
 * Middleware to check IP Whitelisting
 * Should be used after 'authenticate' middleware
 */
export async function checkAccessControl(req: Request, res: Response, next: NextFunction) {
  const userId = req.userId;
  if (!userId) return next(); // Not authenticated, let 'authenticate' handle or public route

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { allowedIPs: true }
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    // 1. IP Whitelisting
    if (user.allowedIPs.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress;
      
      // Basic check (in production use a lib like 'ip-range-check' for CIDR)
      const isAllowed = user.allowedIPs.some(ip => {
        if (ip === clientIp) return true;
        // Handle IPv6 loopback vs IPv4
        if (ip === '127.0.0.1' && (clientIp === '::1' || clientIp === '::ffff:127.0.0.1')) return true;
        return false;
      });

      if (!isAllowed) {
        console.warn(`Blocked access for User ${userId} from IP ${clientIp}`);
        return res.status(403).json({
          message: 'Access restricted: Untrusted IP address',
          ip: clientIp
        });
      }
    }

    return next();
  } catch (error) {
    console.error('Access control check failed:', error);
    return next(error);
  }
}
