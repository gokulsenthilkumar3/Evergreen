import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { recordAuditLog, AuditAction } from '../../utils/audit';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      roles: {
        select: {
          role: { select: { code: true } }
        }
      }
    },
  });

  // Flatten role for frontend
  const flatUser = user ? {
    ...user,
    role: user.roles[0]?.role?.code || 'USER'
  } : null;

  return res.json({ user: flatUser });
});

usersRouter.patch('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = z.object({
      name: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
    }).parse(req.body);

    const updateData = {
      ...(name && { name }),
      ...(email && email !== '' && { email }),
    };

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: { id: true, email: true, name: true, status: true },
    });

    return res.json({ user });
  } catch (e) {
    return next(e);
  }
});

usersRouter.get(
  '/',
  authenticate,
  requirePermission('users.read'),
  async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        roles: {
          select: {
            role: { select: { code: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Flatten roles
    const flatUsers = users.map(u => ({
      ...u,
      role: u.roles[0]?.role?.code || 'USER'
    }));

    return res.json({ users: flatUsers });
  }
);

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(12),
  roleCodes: z.array(z.string().min(1)).default([]),
});

usersRouter.post(
  '/',
  authenticate,
  requirePermission('users.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createUserSchema.parse(req.body);

      const passwordHash = await bcrypt.hash(body.password, 10);

      const roles = await prisma.role.findMany({
        where: { code: { in: body.roleCodes } },
        select: { id: true },
      });

      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          passwordHash,
          roles: {
            create: roles.map((r: { id: string }) => ({ roleId: r.id })),
          },
        },
        select: { id: true, email: true, name: true, status: true, createdAt: true },
      });

      return res.status(201).json({ user });
    } catch (e) {
      return next(e);
    }
  }
);
// --- IP Whitelisting (Task 28) ---

usersRouter.get('/me/security', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { allowedIPs: true, trustedDevices: true }
  });
  return res.json({ security: user });
});

usersRouter.patch('/me/ip-whitelist', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ips } = z.object({ ips: z.array(z.string()) }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { allowedIPs: ips },
      select: { allowedIPs: true }
    });

    await recordAuditLog(AuditAction.IP_WHITELIST_UPDATE, {
      userId: req.userId,
      metadata: { ips },
      ip: req.ip,
      userAgent: req.header('user-agent')
    });
    return res.json({ allowedIPs: user.allowedIPs });
  } catch (e) {
    return next(e);
  }
});

// --- Device Management (Task 28) ---

usersRouter.delete('/me/devices/:deviceId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req.params;
    await prisma.trustedDevice.delete({
      where: {
        id: deviceId, // Assuming ID is passed, not deviceId (uuid)
        userId: req.userId
      }
    });

    await recordAuditLog(AuditAction.DEVICE_REVOKED, {
      userId: req.userId,
      metadata: { deviceId },
      ip: req.ip,
      userAgent: req.header('user-agent')
    });
    return res.json({ message: 'Device revoked' });
  } catch (e) {
    return next(e);
  }
});
/**
 * UPDATE User (PUT /:id)
 * Admin only. Cannot change email. Can change role/status/name.
 */
usersRouter.put(
  '/:id',
  authenticate,
  requirePermission('users.update'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
      });
      const body = schema.parse(req.body);

      // Prevent modifying main admin's critical fields if strict
      // Ideally prevent demoting main admin
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) return res.status(404).json({ message: 'User not found' });

      if (targetUser.email === 'gokulkangeyan@gmail.com') {
        // Allow name update, but prevent role/status change for safety?
        if (body.role && body.role !== 'ADMIN') {
          return res.status(403).json({ message: 'Cannot demote Main Admin.' });
        }
        if (body.status && body.status !== 'ACTIVE') {
          return res.status(403).json({ message: 'Cannot deactivate Main Admin.' });
        }
      }

      // Handle Role Update (requires finding role ID)
      let roleUpdate = {};
      if (body.role) {
        const roleRecord = await prisma.role.findFirst({ where: { code: body.role } });
        if (roleRecord) {
          // Replace existing roles or add? Usually Replace for simple UI.
          // We'll disconnect all and connect new one.
          roleUpdate = {
            roles: {
              deleteMany: {},
              create: { roleId: roleRecord.id }
            }
          };
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.status && { status: body.status }),
          ...roleUpdate
        },
        select: { id: true, email: true, name: true, status: true }
      });

      return res.json({ user });
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * DELETE User (DELETE /:id)
 * Admin only. Protected admins cannot be deleted.
 */
usersRouter.delete(
  '/:id',
  authenticate,
  requirePermission('users.delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Protection Logic
      if (user.email === 'gokulkangeyan@gmail.com') {
        return res.status(403).json({ message: 'Cannot delete protected system administrator.' });
      }

      if (user.id === req.userId) {
        return res.status(403).json({ message: 'Cannot delete your own account.' });
      }

      await prisma.user.delete({ where: { id } });

      await recordAuditLog(AuditAction.ACCOUNT_DELETED, { // Using existing enum
        userId: req.userId,
        metadata: { deletedUserEmail: user.email },
        ip: req.ip,
        userAgent: req.header('user-agent')
      });

      return res.json({ message: 'User deleted successfully' });
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * INVITE User (POST /invite)
 * Admin sends email (mock) and creates user with temp password or token.
 * Alias for strict creation flow.
 */
usersRouter.post(
  '/invite',
  authenticate,
  requirePermission('users.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Re-use create schema logic or similar
      const schema = z.object({
        email: z.string().email(),
        name: z.string().optional(),
        role: z.string().default('USER'),
      });
      const body = schema.parse(req.body);

      // Check existence
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) return res.status(400).json({ message: 'User already exists' });

      // Create with default password
      const passwordHash = await bcrypt.hash('welcome123', 10);

      const roleRecord = await prisma.role.findFirst({ where: { code: body.role } });

      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          passwordHash,
          status: 'PENDING',
          roles: roleRecord ? {
            create: { roleId: roleRecord.id }
          } : undefined
        },
        select: { id: true, email: true }
      });

      // TODO: Send Email logic here
      console.log(`[Email Mock] Invite sent to ${body.email}`);

      return res.json({ message: 'Invitation sent', user });
    } catch (e) {
      return next(e);
    }
  }
);
