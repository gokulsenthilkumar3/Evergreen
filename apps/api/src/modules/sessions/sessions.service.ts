import { appendUserAudit } from '../../utils/user-audit';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { DEFAULT_SESSION_POLICY, sessionExpired } from '../../utils/session-policy';

const SESSION_FIELDS = { id: true, userId: true, ipAddress: true, location: true, device: true, userAgent: true, isValid: true, createdAt: true, lastActive: true, expiresAt: true, lastSeenAt: true } as const;

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findSessionsForUser(user: { userId: number; role: string; sessionId?: string }) {
    const sessions = await this.prisma.session.findMany({
      where: user.role === 'ADMIN' ? undefined : { userId: user.userId },
      select: {
        ...SESSION_FIELDS,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { lastActive: 'desc' },
    });
    const policies = await this.prisma.userSessionPolicy.findMany();
    return sessions.map(session => {
      const policy = policies.find(item=>item.role===session.user.role)||DEFAULT_SESSION_POLICY;
      return {...session,lastActive:session.lastSeenAt||session.lastActive,expired:sessionExpired(session,policy),isCurrent:session.id===user.sessionId};
    });
  }

  async revokeSession(id: string, user: { userId: number; role: string; username?: string }) {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (user.role !== 'ADMIN' && session.userId !== user.userId) {
      throw new ForbiddenException('You can only revoke your own sessions');
    }

    return this.prisma.$transaction(async tx => {
      const result = await tx.session.update({ where: { id }, data: { isValid: false }, select: SESSION_FIELDS });
      await appendUserAudit(tx, { data: { username: user.username || `user:${user.userId}`, action: 'REVOKE_SESSION', module: 'USER_MANAGEMENT', details: `Revoked sessions for user ${session.userId}: session ${id}` } });
      return result;
    });
  }
}
