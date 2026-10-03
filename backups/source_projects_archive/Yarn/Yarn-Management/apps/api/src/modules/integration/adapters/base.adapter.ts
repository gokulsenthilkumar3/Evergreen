export interface VerificationResult {
    success: boolean;
    message: string;
}

export interface SyncResult {
    success: boolean;
    recordsProcessed: number;
    details?: any;
    error?: string;
}

export interface IntegrationAdapter {
    verifyCredentials(credentials: any): Promise<VerificationResult>;
    syncData(entityType: string, options?: any): Promise<SyncResult>;
}
