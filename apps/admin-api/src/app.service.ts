import { Injectable } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';

@Injectable()
export class AppService {
  private startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'EverGreen Provider Admin API is running smoothly.';
  }

  async getHealthData() {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10;
    const heapTotalMB = Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10;
    const rssMB = Math.round((mem.rss / 1024 / 1024) * 10) / 10;

    let dbStatus = 'CONNECTED';
    let companyCount = 0;
    try {
      companyCount = await this.prisma.company.count();
    } catch {
      dbStatus = 'DEGRADED';
    }

    return {
      service: 'evergreen-admin-api',
      status: dbStatus === 'CONNECTED' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: uptimeSec,
      memory: { heapUsedMB, heapTotalMB, rssMB },
      database: {
        provider: 'SQLite (Prisma ORM)',
        status: dbStatus,
        tenantsManaged: companyCount,
      },
    };
  }
}
