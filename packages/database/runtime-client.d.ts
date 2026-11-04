import type { Prisma, PrismaClient } from '@prisma/client';
export declare function createDatabaseClient(options?: Prisma.PrismaClientOptions): PrismaClient;
export declare function decodeDecimals<T>(value: T): T;
