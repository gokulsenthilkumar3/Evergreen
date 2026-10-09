import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { apiKeyService } from './apikey.service';
import { webhookService } from './webhook.service';

export const developerRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Developer
 *   description: Developer tools management (API Keys, Webhooks)
 */

// --- API Keys ---

/**
 * @swagger
 * /developer/keys:
 *   get:
 *     summary: List API keys
 *     tags: [Developer]
 *     responses:
 *       200:
 *         description: List of API keys
 */
developerRouter.get('/keys', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const keys = await apiKeyService.listKeys(userId);
        res.json(keys);
    } catch (e) { next(e); }
});

/**
 * @swagger
 * /developer/keys:
 *   post:
 *     summary: Generate a new API key
 *     tags: [Developer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The generated API key
 */
developerRouter.post('/keys', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const key = await apiKeyService.generateKey(userId, req.body.name);
        res.json(key);
    } catch (e) { next(e); }
});

developerRouter.delete('/keys/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        await apiKeyService.revokeKey(req.params.id, userId);
        res.json({ success: true });
    } catch (e) { next(e); }
});


// --- Webhooks ---

/**
 * @swagger
 * /developer/webhooks:
 *   get:
 *     summary: List webhook subscriptions
 *     tags: [Developer]
 *     responses:
 *       200:
 *         description: List of webhooks
 */
developerRouter.get('/webhooks', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const hooks = await webhookService.listWebhooks(userId);
        res.json(hooks);
    } catch (e) { next(e); }
});

developerRouter.post('/webhooks', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { url, events, secret } = req.body;
        const hook = await webhookService.registerWebhook(userId, url, events, secret);
        res.json(hook);
    } catch (e) { next(e); }
});

developerRouter.delete('/webhooks/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        await webhookService.deleteWebhook(req.params.id, userId);
        res.json({ success: true });
    } catch (e) { next(e); }
});

developerRouter.get('/logs', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const logs = await webhookService.getLogs(userId);
        res.json(logs);
    } catch (e) { next(e); }
});
