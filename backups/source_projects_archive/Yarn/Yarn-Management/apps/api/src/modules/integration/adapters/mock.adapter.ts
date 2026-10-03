import { IntegrationAdapter, SyncResult, VerificationResult } from './base.adapter';

export class MockAdapter implements IntegrationAdapter {
    private providerName: string;

    constructor(providerName: string) {
        this.providerName = providerName;
    }

    async verifyCredentials(credentials: any): Promise<VerificationResult> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (credentials.apiKey === 'fail') {
            return { success: false, message: 'Invalid API Key' };
        }

        return { success: true, message: `Successfully connected to ${this.providerName}` };
    }

    async syncData(entityType: string, options?: any): Promise<SyncResult> {
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate random success/failure or varying record counts
        const count = Math.floor(Math.random() * 50) + 1;

        return {
            success: true,
            recordsProcessed: count,
            details: {
                message: `Mock sync completed for ${entityType}`,
                timestamp: new Date().toISOString()
            }
        };
    }
}
