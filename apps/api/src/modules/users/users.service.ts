import { appendUserAudit } from '../../utils/user-audit';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';
import { hashPassword } from '../auth/passwords';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const PUBLIC_USER_FIELDS = {
  id: true,
  publicId: true, status: true, statusReason: true, statusChangedAt: true, deletedAt: true,
  department: true, site: true, locale: true, timezone: true,
  failedLogins: true, lockedUntil: true,
  username: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string) {
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException(
        'Password must contain at least 12 characters and at most 72 UTF-8 bytes',
      );
    }
    return hashPassword(password);
  }

  private handleConflict(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Username or email already exists');
    }
    throw error;
  }

  async createUser(input: CreateUserDto, actor: string) {
    const password = await this.hashPassword(input.password);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const settings = await tx.systemSettings.findFirst({ select: { maxUsers: true } });
        if (settings && await tx.user.count({ where: { status: { not: 'DELETED' } } }) >= settings.maxUsers) throw new BadRequestException('User licence quota reached');
        const user = await tx.user.create({
          data: {
            username: input.username,
            email: input.email,
            name: input.name,
            password,
            role: input.role ?? 'VIEWER',
            status: 'PENDING',
            createdBy: actor,
          },
          select: PUBLIC_USER_FIELDS,
        });
        await appendUserAudit(tx, {
          data: {
            username: actor,
            action: 'CREATE',
            module: 'USER_MANAGEMENT',
            details: `Created user ${user.id} (${user.role})`,
          },
        });
        return user;
      });
    } catch (error) {
      this.handleConflict(error);
    }
  }

  findAllUsers() {
    return this.prisma.user.findMany({
      select: PUBLIC_USER_FIELDS,
      orderBy: { username: 'asc' },
    });
  }

  async securityDetails(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, isTotpEnabled: true,
        credentials: { select: { id: true, deviceType: true, backedUp: true, createdAt: true, lastUsed: true } },
        sessions: { select: { id: true, ipAddress: true, device: true, userAgent: true, isValid: true, createdAt: true, lastActive: true }, orderBy: { lastActive: 'desc' }, take: 100 },
        _count: { select: { sessions: { where: { isValid: true } } } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const activity = await this.prisma.activityLog.findMany({
      where: { OR: [
        { username: user.username },
        { module: 'USER_MANAGEMENT', OR: [
          { details: { startsWith: `Updated user ${id}:` } },
          { details: { startsWith: `Created user ${id} (` } },
          { details: { startsWith: `Revoked sessions for user ${id}:` } },
        ] },
      ] },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 50,
    });
    return { ...user, activity };
  }

  async revokeAllSessions(id: number, actor: string, reason: string) {
    if (reason.trim().length < 5 || reason.trim().length > 500) throw new BadRequestException('Revocation reason must contain 5–500 characters');
    return this.prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { id }, select: { id: true } });
      if (!user) throw new NotFoundException('User not found');
      const result = await tx.session.updateMany({ where: { userId: id, isValid: true }, data: { isValid: false } });
      await appendUserAudit(tx, { data: { username: actor, action: 'REVOKE_SESSIONS', module: 'USER_MANAGEMENT', details: `Revoked sessions for user ${id}: ${result.count}; reason: ${reason.trim()}` } });
      return { revoked: result.count };
    });
  }

  async updateUser(id: number, input: UpdateUserDto, actor: string) {
    const password =
      input.password === undefined
        ? undefined
        : await this.hashPassword(input.password);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({ where: { id } });
        if (!existing || existing.status === 'DELETED') throw new NotFoundException('User not found');
        if (input.username !== undefined && input.username !== existing.username) throw new BadRequestException('Username is permanent; change the display name instead');
        if (input.email !== undefined && input.email !== existing.email) throw new BadRequestException('Email changes require mailbox verification in Security Settings');
        if (
          existing.role === 'ADMIN' &&
          input.role !== undefined &&
          input.role !== 'ADMIN' &&
          existing.status === 'ACTIVE' && (await tx.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })) <= 1
        ) {
          throw new BadRequestException(
            'The last administrator cannot be demoted',
          );
        }
        const user = await tx.user.update({
          where: { id },
          data: {
            username: input.username,
            name: input.name,
            email: input.email,
            role: input.role,
            ...(input.role === 'ADMIN' ? { scopedAccess: false } : {}),
            password,
            updatedBy: actor,
          },
          select: PUBLIC_USER_FIELDS,
        });
        if (
          password !== undefined ||
          (input.role !== undefined && input.role !== existing.role)
        ) {
          if (input.role === 'ADMIN') await tx.userAccessRule.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
          await tx.session.updateMany({
            where: { userId: id, isValid: true },
            data: { isValid: false },
          });
        }
        await appendUserAudit(tx, {
          data: {
            username: actor,
            action: 'UPDATE',
            module: 'USER_MANAGEMENT',
            details: `Updated user ${id}: ${Object.keys(input).join(', ')}`,
          },
        });
        return user;
      });
    } catch (error) {
      this.handleConflict(error);
    }
  }

  async deleteUser(id: number, actorId: number, actor: string) {
    return this.changeStatus(id, 'DELETED', 'Soft deleted by administrator', actorId, actor);
  }

  async changeStatus(id: number, status: string, reason: string, actorId: number, actor: string) {
    if (!['PENDING','ACTIVE','SUSPENDED','DISABLED','DELETED'].includes(status) || reason.trim().length < 5 || reason.trim().length > 500) throw new BadRequestException('A valid status and 5–500 character reason are required');
    if (id === actorId)
      throw new BadRequestException('You cannot change your own account status');
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      const transitions: Record<string, string[]> = { PENDING: ['ACTIVE','DISABLED','DELETED'], ACTIVE: ['SUSPENDED','DISABLED','DELETED'], SUSPENDED: ['ACTIVE','DISABLED','DELETED'], DISABLED: ['ACTIVE','DELETED'], DELETED: ['ACTIVE'] };
      if (!(transitions[user.status] || []).includes(status)) throw new BadRequestException('Invalid account status transition');
      if (user.status === 'PENDING' && status === 'ACTIVE' && (!user.isTotpEnabled || !user.emailVerifiedAt)) throw new BadRequestException('Pending accounts must complete email verification and MFA onboarding');
      if (
        user.role === 'ADMIN' && user.status === 'ACTIVE' && status !== 'ACTIVE' &&
        (await tx.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })) <= 1
      ) {
        throw new BadRequestException(
          'The last active administrator cannot be deactivated',
        );
      }
      if (user.status === 'DELETED' && status !== 'ACTIVE') throw new BadRequestException('Restore this account before changing its status');
      if (user.status === 'DELETED' && status === 'ACTIVE') {
        const settings = await tx.systemSettings.findFirst({ select: { maxUsers: true } });
        if (settings && await tx.user.count({ where: { status: { not: 'DELETED' } } }) >= settings.maxUsers) throw new BadRequestException('User licence quota reached');
      }
      const updated = await tx.user.update({ where: { id }, data: { status, statusReason: reason.trim(), statusChangedAt: new Date(), deletedAt: status === 'DELETED' ? new Date() : null, updatedBy: actor, currentChallenge: null }, select: PUBLIC_USER_FIELDS });
      if (status !== 'ACTIVE') await tx.session.updateMany({ where: { userId: id, isValid: true }, data: { isValid: false } });
      await appendUserAudit(tx, {
        data: {
          username: actor,
          action: 'STATUS_CHANGE',
          module: 'USER_MANAGEMENT',
          details: `Updated user ${id}: status ${user.status} -> ${status}; reason: ${reason.trim()}`,
        },
      });
      return updated;
    });
  }
}
