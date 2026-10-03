import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as notificationService from './notification.service';

export const notificationRouter = Router();

// Get user notifications
notificationRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        // Guard against missing userId
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { type, read, limit, offset } = req.query;

        const notifications = await notificationService.getUserNotifications(userId, {
            type: type as notificationService.NotificationFilters['type'],
            read: read === 'true' ? true : read === 'false' ? false : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
        });

        const unreadCount = await notificationService.getUnreadCount(userId);

        return res.json({ notifications, unreadCount });
    } catch (e) {
        return next(e);
    }
});

// Get unread count
notificationRouter.get('/unread-count', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const count = await notificationService.getUnreadCount(userId);
        return res.json({ count });
    } catch (e) {
        return next(e);
    }
});

// Mark notification as read
notificationRouter.patch('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id);
        return res.json(notification);
    } catch (e) {
        return next(e);
    }
});

// Mark all as read
notificationRouter.patch('/mark-all-read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await notificationService.markAllAsRead(userId);
        return res.json({ success: true });
    } catch (e) {
        return next(e);
    }
});

// Delete notification
notificationRouter.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await notificationService.deleteNotification(id);
        return res.json({ success: true });
    } catch (e) {
        return next(e);
    }
});
