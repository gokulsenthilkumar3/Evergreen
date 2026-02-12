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

            // Initialize default admin user if no users exist
            const userCount = await this.user.count();
            console.log(`📊 Current user count: ${userCount}`);
            if (userCount === 0) {
                console.log('🤖 Initializing default admin user...');
                await this.user.create({
                    data: {
                        username: 'author',
                        password: 'author123', // In production, this should be hashed
                        email: `admin-${Date.now()}@evergreen.local`,
                        role: 'ADMIN',
                    },
                });
                console.log('✅ Default admin user created: author/author123');
            }
        } catch (error) {
            console.error('❌ Error during Prisma initialization:', error);
        }
    }

    async onModuleDestroy() {
        console.log('🔌 Disconnecting from Prisma...');
        await this.$disconnect();
    }
}
