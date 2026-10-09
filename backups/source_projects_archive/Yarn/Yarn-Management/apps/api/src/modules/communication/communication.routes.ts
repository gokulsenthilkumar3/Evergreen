import { Router } from 'express';
import * as communicationService from './communication.service';

const router = Router();

// Message routes
router.post('/messages', async (req, res) => {
    try {
        const message = await communicationService.sendMessage(req.body);
        res.status(201).json({ message });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const messages = await communicationService.listMessages(req.query as any);
        res.json({ messages });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/messages/:id', async (req, res) => {
    try {
        const message = await communicationService.getMessageById(req.params.id);
        if (!message) return res.status(404).json({ error: 'Message not found' });
        res.json({ message });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/messages/:id/read', async (req, res) => {
    try {
        const message = await communicationService.markMessageAsRead(req.params.id);
        res.json({ message });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/messages/:id', async (req, res) => {
    try {
        await communicationService.deleteMessage(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/messages/unread/count', async (req, res) => {
    try {
        const { userId } = req.query;
        const count = await communicationService.getUnreadMessageCount(userId as string);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Announcement routes
router.post('/announcements', async (req, res) => {
    try {
        const announcement = await communicationService.createAnnouncement(req.body);
        res.status(201).json({ announcement });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/announcements', async (req, res) => {
    try {
        const announcements = await communicationService.listAnnouncements(req.query as any);
        res.json({ announcements });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/announcements/:id', async (req, res) => {
    try {
        const announcement = await communicationService.getAnnouncementById(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
        res.json({ announcement });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/announcements/:id', async (req, res) => {
    try {
        const announcement = await communicationService.updateAnnouncement(req.params.id, req.body);
        res.json({ announcement });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/announcements/:id', async (req, res) => {
    try {
        await communicationService.deleteAnnouncement(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
