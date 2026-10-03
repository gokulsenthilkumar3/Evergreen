import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findSessionsForUser(user: { userId: number; role: string }) {
    return this.prisma.session.findMany({
      where: user.role === 'ADMIN' ? undefined : { userId: user.userId },
      include: {
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
  }

  async revokeSession(id: string, user: { userId: number; role: string }) {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (user.role !== 'ADMIN' && session.userId !== user.userId) {
      throw new ForbiddenException('You can only revoke your own sessions');
    }

    return this.prisma.session.update({
      where: { id },
      data: { isValid: false },
    });
  }
}
