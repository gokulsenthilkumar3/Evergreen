import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) {}

    async findAllSessions() {
        return this.prisma.session.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: { lastActive: 'desc' }
        });
    }

    async revokeSession(id: string) {
        const session = await this.prisma.session.findUnique({
            where: { id }
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return this.prisma.session.update({
            where: { id },
            data: { isValid: false }
        });
    }
}
