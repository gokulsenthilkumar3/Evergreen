import { prisma } from '../../prisma/client';
import { IntegrationAdapter } from './adapters/base.adapter';
import { MockAdapter } from './adapters/mock.adapter';
import { ProviderType, IntegrationStatus, SyncStatus } from '@prisma/client';

export class IntegrationService {

    private getAdapter(provider: ProviderType): IntegrationAdapter {
        // In a real app, strict mapping would return specific adapters (e.g. TallyAdapter)
        // For this implementation, we use MockAdapter for everything.
        return new MockAdapter(provider.toString());
    }

    async getAllConfigs() {
        return prisma.integrationConfig.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                // Include latest sync log? or fetch separately
                syncLogs: {
                    take: 1,
                    orderBy: { startedAt: 'desc' }
                }
            }
        });
    }

    async getConfig(id: string) {
        return prisma.integrationConfig.findUniqueOrThrow({ where: { id } });
    }

    async upsertConfig(provider: ProviderType, name: string, credentials: any, settings: any) {
        // 1. Verify credentials first
        const adapter = this.getAdapter(provider);
        const verify = await adapter.verifyCredentials(credentials);

        if (!verify.success) {
            throw new Error(`Verification failed: ${verify.message}`);
        }

        // 2. Save config
        return prisma.integrationConfig.upsert({
            where: { provider },
            create: {
                provider,
                name,
                isEnabled: true,
                credentials,
                settings,
                status: IntegrationStatus.CONNECTED
            },
            update: {
                name,
                credentials, // In real app, merge or handle partial updates carefully
                settings,
                status: IntegrationStatus.CONNECTED,
                isEnabled: true
            }
        });
    }

    async toggleIntegration(id: string, isEnabled: boolean) {
        return prisma.integrationConfig.update({
            where: { id },
            data: { isEnabled }
        });
    }

    async triggerSync(id: string, entityType: string) {
        const config = await prisma.integrationConfig.findUniqueOrThrow({ where: { id } });

        if (!config.isEnabled) {
            throw new Error("Integration is disabled");
        }

        // Create SyncLog entry
        const log = await prisma.syncLog.create({
            data: {
                integrationId: id,
                entityType,
                action: 'MANUAL_SYNC',
                status: SyncStatus.IN_PROGRESS
            }
        });

        // Execute sync (async in background usually, but awaiting here for demo or simplified flow)
        // In production, use queue (BullMQ)
        try {
            const adapter = this.getAdapter(config.provider);
            const result = await adapter.syncData(entityType);

            await prisma.syncLog.update({
                where: { id: log.id },
                data: {
                    status: result.success ? SyncStatus.SUCCESS : SyncStatus.FAILED,
                    recordsCount: result.recordsProcessed,
                    details: result.details || { error: result.error },
                    completedAt: new Date()
                }
            });

            await prisma.integrationConfig.update({
                where: { id },
                data: { lastSyncAt: new Date() }
            });

            return { ...log, status: result.success ? SyncStatus.SUCCESS : SyncStatus.FAILED, ...result };
        } catch (error: any) {
            await prisma.syncLog.update({
                where: { id: log.id },
                data: {
                    status: SyncStatus.FAILED,
                    details: { error: error.message },
                    completedAt: new Date()
                }
            });
            throw error;
        }
    }

    async getSyncLogs(integrationId: string) {
        return prisma.syncLog.findMany({
            where: { integrationId },
            orderBy: { startedAt: 'desc' },
            take: 50
        });
    }
}

export const integrationService = new IntegrationService();
