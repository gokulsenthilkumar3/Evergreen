import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    console.log('🏗️ PrismaService constructed');
  }
  async onModuleInit() {
    console.log('🔌 Connecting to Prisma database...');
    // DATABASE_URL may contain production credentials; never print it.
    await this.$connect();
    console.log('✅ Prisma connected.');
  }

  async onModuleDestroy() {
    console.log('🔌 Disconnecting from Prisma...');
    await this.$disconnect();
  }
}
