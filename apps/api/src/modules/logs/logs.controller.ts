import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Controller('logs')
export class LogsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getLogs() {
        return this.prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }
}
