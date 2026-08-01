import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
        console.log('🏗️ PrismaService constructed');
    }
    async onModuleInit() {
        console.log('🔌 Connecting to Prisma database...');
        console.log(`📂 Database URL: ${process.env.DATABASE_URL}`);
        try {
            await this.$connect();
            console.log('✅ Prisma connected.');

        } catch (error) {
            console.error('❌ Error during Prisma initialization:', error);
        }
    }

    async onModuleDestroy() {
        console.log('🔌 Disconnecting from Prisma...');
        await this.$disconnect();
    }
}
