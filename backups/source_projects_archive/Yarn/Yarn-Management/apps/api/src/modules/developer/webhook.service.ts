import { prisma } from '../../prisma/client';
import axios from 'axios';
import crypto from 'crypto';

export class WebhookService {

    async registerWebhook(userId: string, url: string, events: string[], secret?: string) {
        return prisma.webhookSubscription.create({
            data: {
                userId,
                url,
                events,
                secret: secret || crypto.randomBytes(32).toString('hex'),
                isActive: true
            }
        });
    }

    async listWebhooks(userId: string) {
        return prisma.webhookSubscription.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteWebhook(id: string, userId: string) {
        const hook = await prisma.webhookSubscription.findUnique({ where: { id } });
        if (!hook || hook.userId !== userId) throw new Error("Webhook not found");

        return prisma.webhookSubscription.delete({ where: { id } });
    }

    async dispatchEvent(event: string, payload: any) {
        // 1. Find all active subscriptions for this event
        const subscriptions = await prisma.webhookSubscription.findMany({
            where: {
                isActive: true,
                events: { has: event }
            }
        });

        // 2. Dispatch to all
        for (const sub of subscriptions) {
            this.sendWebhook(sub, event, payload).catch(console.error);
        }
    }

    private async sendWebhook(sub: any, event: string, payload: any) {
        const signature = sub.secret
            ? crypto.createHmac('sha256', sub.secret).update(JSON.stringify(payload)).digest('hex')
            : null;

        const headers: any = {
            'Content-Type': 'application/json',
            'X-Yarn-Event': event,
            'X-Yarn-Delivery-Id': crypto.randomUUID()
        };

        if (signature) {
            headers['X-Yarn-Signature'] = signature;
        }

        let status = 'SUCCESS';
        let responseCode = 200;
        let responseBody = '';

        try {
            const response = await axios.post(sub.url, payload, { headers, timeout: 5000 });
            responseCode = response.status;
            responseBody = JSON.stringify(response.data).substring(0, 1000); // Truncate
        } catch (error: any) {
            status = 'FAILED';
            responseCode = error.response?.status || 0;
            responseBody = error.message;
        }

        // Log the attempt
        await prisma.webhookLog.create({
            data: {
                subscriptionId: sub.id,
                event,
                payload: payload as any,
                status,
                responseCode,
                responseBody,
                attempt: 1 // Simple logic for now, could add retry attempts loop
            }
        });
    }

    async getLogs(userId: string) {
        return prisma.webhookLog.findMany({
            where: {
                subscription: { userId }
            },
            orderBy: { firedAt: 'desc' },
            take: 50,
            include: { subscription: true }
        });
    }
}

export const webhookService = new WebhookService();
