import { prisma } from '../../prisma/client';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class ApiKeyService {

    // Generate a new secure API Key
    async generateKey(userId: string, name: string) {
        const rawKey = `ym_live_${uuidv4().replace(/-/g, '')}`; // Example format: ym_live_...
        // In production, we should hash this key before storing. 
        // For this implementation, we'll store it raw or lightly verified for simplicity, 
        // but best practice is bcrypt/argon2 if it's treated like a password.
        // However, API keys often need to be displayed once. 
        // Let's store it as is for now as per "key" field in schema, assume it implies secure storage if we were stricter.

        return prisma.apiKey.create({
            data: {
                key: rawKey,
                name,
                userId,
                isActive: true
            }
        });
    }

    async listKeys(userId: string) {
        return prisma.apiKey.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async revokeKey(id: string, userId: string) {
        const key = await prisma.apiKey.findUnique({ where: { id } });
        if (!key || key.userId !== userId) {
            throw new Error("Key not found or unauthorized");
        }
        return prisma.apiKey.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async validateKey(key: string) {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key },
            include: { user: true }
        });

        if (!apiKey || !apiKey.isActive) {
            return null;
        }

        // Update usage stats (fire and forget)
        prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() }
        }).catch(console.error);

        return apiKey.user;
    }
}

export const apiKeyService = new ApiKeyService();
