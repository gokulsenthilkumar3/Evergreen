import { Router } from 'express';
import * as supportService from './support.service';

const router = Router();

// Ticket routes
router.post('/tickets', async (req, res) => {
    try {
        const ticket = await supportService.createTicket(req.body);
        res.status(201).json({ ticket });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/tickets', async (req, res) => {
    try {
        const tickets = await supportService.listTickets(req.query as any);
        res.json({ tickets });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tickets/stats', async (req, res) => {
    try {
        const stats = await supportService.getTicketStats();
        res.json({ stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tickets/:id', async (req, res) => {
    try {
        const ticket = await supportService.getTicketById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json({ ticket });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


router.patch('/tickets/:id', async (req, res) => {
    try {
        const ticket = await supportService.updateTicket(req.params.id, req.body);
        res.json({ ticket });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/tickets/:id/assign', async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const ticket = await supportService.assignTicket(req.params.id, assignedTo);
        res.json({ ticket });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/tickets/:id/comments', async (req, res) => {
    try {
        const comment = await supportService.addTicketComment({
            ticketId: req.params.id,
            ...req.body
        });
        res.status(201).json({ comment });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Knowledge Base routes
router.post('/kb/articles', async (req, res) => {
    try {
        const article = await supportService.createArticle(req.body);
        res.status(201).json({ article });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/kb/articles', async (req, res) => {
    try {
        const articles = await supportService.listArticles(req.query as any);
        res.json({ articles });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/kb/articles/:id', async (req, res) => {
    try {
        const article = await supportService.getArticleById(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        res.json({ article });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/kb/articles/:id', async (req, res) => {
    try {
        const article = await supportService.updateArticle(req.params.id, req.body);
        res.json({ article });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/kb/articles/:id/publish', async (req, res) => {
    try {
        const article = await supportService.publishArticle(req.params.id);
        res.json({ article });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/kb/articles/:id/helpful', async (req, res) => {
    try {
        const article = await supportService.markArticleHelpful(req.params.id);
        res.json({ article });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
