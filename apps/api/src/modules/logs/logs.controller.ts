import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Controller('logs')
export class LogsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getLogs(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('module') module?: string,
        @Query('action') action?: string,
    ) {
        const where: any = {};

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from + 'T00:00:00Z');
            if (to) where.createdAt.lte = new Date(to + 'T23:59:59Z');
        }

        if (module) {
            where.module = { contains: module };
        }

        if (action) {
            where.action = action;
        }

        const logs = await this.prisma.activityLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 500,
        });

        // Map the logs to the expected frontend format
        return logs.map((log: any) => ({
            id: log.id,
            timestamp: log.createdAt,
            action: log.action,
            module: log.module,
            username: log.userId || log.username || 'System',
            details: log.details,
        }));
    }
}
