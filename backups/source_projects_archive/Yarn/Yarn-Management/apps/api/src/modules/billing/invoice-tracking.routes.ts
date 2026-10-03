import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import * as trackingService from './invoice-tracking.service';
import * as templateService from './invoice-templates.service';
import { z } from 'zod';

const router = Router();

// --- Tracking ---

router.get('/invoices/:id/tracking', authenticate, async (req, res) => {
    try {
        const tracking = await trackingService.getInvoiceTracking(req.params.id);
        if (!tracking) return res.status(404).json({ message: 'Invoice not found' });
        res.json(tracking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/invoices/:id/status', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        // Basic validation
        if (!status) return res.status(400).json({ message: 'Status is required' });

        const updated = await trackingService.updateInvoiceTracking(req.params.id, req.userId!, status, notes);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/invoices/:id/reminders', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        const schema = z.object({
            reminderType: z.enum(['AUTO', 'MANUAL']),
            nextReminderAt: z.string().optional(),
        });
        const data = schema.parse(req.body);

        const reminder = await trackingService.createReminder(req.userId!, {
            invoiceId: req.params.id,
            reminderType: data.reminderType,
            nextReminderAt: data.nextReminderAt ? new Date(data.nextReminderAt) : undefined
        });
        res.json(reminder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- Templates ---

router.get('/templates', authenticate, async (req, res) => {
    try {
        const templates = await templateService.getTemplates();
        res.json({ templates });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/templates', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        const schema = z.object({
            name: z.string(),
            htmlContent: z.string(),
            isDefault: z.boolean().optional(),
        });
        const data = schema.parse(req.body);
        const template = await templateService.createTemplate(req.userId!, data);
        res.json({ template });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/templates/:id', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        const schema = z.object({
            name: z.string().optional(),
            htmlContent: z.string().optional(),
            isDefault: z.boolean().optional(),
        });
        const data = schema.parse(req.body);
        const template = await templateService.updateTemplate(req.params.id, req.userId!, data);
        res.json({ template });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/templates/:id', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        await templateService.deleteTemplate(req.params.id, req.userId!);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export const invoiceTrackingRouterExport = router;
