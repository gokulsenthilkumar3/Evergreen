import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../prisma/client';

type JwtPayload = {
  sub: string;
};

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & { sid?: string };
    const userId = decoded.sub;
    const sessionId = decoded.sid;
    req.userId = userId;

    // Update last active if sessionId exists
    if (sessionId) {
      prisma.refreshToken.update({
        where: { id: sessionId },
        data: { lastActive: new Date() }
      }).catch(err => {
        // Silently fail if session doesn't exist anymore or other DB error
        console.error('Failed to update session lastActive:', err);
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
        allowedIPs: true
      }
    });

    if (!user || user.status === 'DISABLED') {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Attach user to request for context
    (req as any).user = user;

    // IP Whitelisting Check (Task 28)
    if (user.allowedIPs.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress;
      const isAllowed = user.allowedIPs.some((ip: string) => {
        if (ip === clientIp) return true;
        if (ip === '127.0.0.1' && (clientIp === '::1' || clientIp === '::ffff:127.0.0.1')) return true;
        return false;
      });

      if (!isAllowed) {
        console.warn(`Blocked access for User ${user.id} from unauthorized IP: ${clientIp}`);
        return res.status(403).json({
          message: 'Access restricted: Untrusted IP address',
          ip: clientIp
        });
      }
    }

    return next();
  } catch (err) {
    console.error('Authentication failed:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

