import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

type RoleWithPermissions = {
  role: {
    permissions: {
      permission: {
        code: string;
      };
    }[];
  };
};

export function requirePermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const roles: RoleWithPermissions[] = await prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            permissions: {
              select: { permission: { select: { code: true } } },
            },
          },
        },
      },
    });

    const codes = new Set(
      roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code))
    );

    if (!codes.has(permissionCode)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
