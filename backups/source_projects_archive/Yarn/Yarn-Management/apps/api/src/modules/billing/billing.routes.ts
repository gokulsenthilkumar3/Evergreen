import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as billingService from './billing.service';
import * as billingSchemas from './billing.schemas';
import * as paymentService from './invoice-payment.service';
import * as pdfService from './pdf-generator.service';
import * as trackingService from './invoice-tracking.service';
import * as templateService from './invoice-templates.service';
import { requirePermission } from '../../middleware/requirePermission';
import { z } from 'zod';

export const billingRouter = Router();

billingRouter.use((req, res, next) => {
    console.log(`Billing Router hit: ${req.method} ${req.url}`);
    next();
});

// GET ONE INVOICE - MOVE TO TOP FOR TESTING
billingRouter.get('/invoices/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    console.log(`Matching /invoices/:id with ID: ${req.params.id}`);
    try {
        const { id } = req.params;
        const invoice = await billingService.getInvoiceById(id);
        if (!invoice) {
            console.log(`Invoice not found in DB for ID: ${id}`);
            return res.status(404).json({ message: 'Invoice not found in database' });
        }
        return res.json(invoice);
    } catch (e) {
        console.error('Error in getInvoiceById:', e);
        return next(e);
    }
});

// Customers
billingRouter.get('/customers', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const customers = await billingService.getCustomers();
        return res.json({ customers });
    } catch (e) {
        return next(e);
    }
});

billingRouter.post('/customers', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingSchemas.createCustomerSchema.parse(req.body);
        const customer = await billingService.createCustomer(body);
        return res.status(201).json({ customer });
    } catch (e) {
        return next(e);
    }
});

billingRouter.patch('/customers/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = billingSchemas.updateCustomerSchema.parse(req.body);
        const customer = await billingService.updateCustomer(id, body);
        return res.json({ customer });
    } catch (e) {
        return next(e);
    }
});

billingRouter.delete('/customers/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const ok = await billingService.deleteCustomer(id);
        return res.json({ ok });
    } catch (e) {
        return next(e);
    }
});

// Accounts Receivable
billingRouter.get('/ar/customers', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const asOf = typeof req.query.asOf === 'string' ? new Date(req.query.asOf) : undefined;
        const customers = await billingService.getArCustomersSummary(asOf);
        return res.json({ customers });
    } catch (e) {
        return next(e);
    }
});

billingRouter.get('/ar/customers/:id/ledger', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const ledger = await billingService.getCustomerLedger(id);
        if (!ledger) return res.status(404).json({ message: 'Customer not found' });
        return res.json({ ledger });
    } catch (e) {
        return next(e);
    }
});

billingRouter.post('/ar/payments', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingSchemas.createArPaymentSchema.parse(req.body);
        const payment = await billingService.createArPayment(req.userId, body);
        return res.status(201).json({ payment });
    } catch (e) {
        return next(e);
    }
});

billingRouter.get('/ar/follow-ups', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const followUps = await billingService.getArFollowUps({ status });
        return res.json({ followUps });
    } catch (e) {
        return next(e);
    }
});

billingRouter.post('/ar/follow-ups', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingSchemas.createArFollowUpSchema.parse(req.body);
        const followUp = await billingService.createArFollowUp(req.userId, body);
        return res.status(201).json({ followUp });
    } catch (e) {
        return next(e);
    }
});

billingRouter.patch('/ar/follow-ups/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = billingSchemas.updateArFollowUpSchema.parse(req.body);
        const followUp = await billingService.updateArFollowUp(id, body);
        return res.json({ followUp });
    } catch (e) {
        return next(e);
    }
});

billingRouter.post('/ar/bad-debt', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingSchemas.createBadDebtProvisionSchema.parse(req.body);
        const provision = await billingService.createBadDebtProvision(req.userId, body);
        return res.status(201).json({ provision });
    } catch (e) {
        return next(e);
    }
});

billingRouter.get('/ar/metrics', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const metrics = await billingService.getCollectionMetrics();
        return res.json({ metrics });
    } catch (e) {
        return next(e);
    }
});

// Get Invoices
billingRouter.get('/invoices', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invoices = await billingService.getInvoices();
        return res.json({ invoices });
    } catch (e) {
        return next(e);
    }
});

// Create Invoice
billingRouter.post('/invoices', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingService.createInvoiceSchema.parse(req.body);
        const invoice = await billingService.createInvoice(body);
        return res.status(201).json({ invoice });
    } catch (e) {
        return next(e);
    }
});

// Delete Invoice
billingRouter.delete('/invoices/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const success = await billingService.deleteInvoice(id);
        if (!success) {
            // Note: In a real app we might want to return 404 if not found, 
            // but the original code just returned ok: true
        }
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});

// Update Invoice Status
billingRouter.patch('/invoices/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const invoice = await billingService.updateInvoiceStatus(id, status);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        return res.json({ invoice });
    } catch (e) {
        return next(e);
    }
});

// Credit Notes
billingRouter.get('/credit-notes', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const creditNotes = await billingService.getCreditNotes();
        return res.json({ creditNotes });
    } catch (e) {
        return next(e);
    }
});

billingRouter.post('/credit-notes', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingService.createCreditNoteSchema.parse(req.body);
        const creditNote = await billingService.createCreditNote(body);
        return res.status(201).json({ creditNote });
    } catch (e) {
        return next(e);
    }
});

// Debit Notes
billingRouter.get('/debit-notes', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const debitNotes = await billingService.getDebitNotes();
        return res.json({ debitNotes });
    } catch (e) {
        return next(e);
    }
});

billingRouter.post('/debit-notes', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = billingService.createDebitNoteSchema.parse(req.body);
        const debitNote = await billingService.createDebitNote(body);
        return res.status(201).json({ debitNote });
    } catch (e) {
        return next(e);
    }
});

// ======= ENHANCED INVOICE MANAGEMENT ROUTES =======

// Record partial payment
billingRouter.post('/invoices/:id/payments', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const payment = await paymentService.recordPartialPayment(id, req.body);
        return res.status(201).json({ payment });
    } catch (e: any) {
        return res.status(400).json({ message: e.message || 'Failed to record payment' });
    }
});

// Get invoice payments
billingRouter.get('/invoices/:id/payments', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const payments = await paymentService.getInvoicePayments(id);
        return res.json({ payments });
    } catch (e) {
        return next(e);
    }
});

// Get invoice history
billingRouter.get('/invoices/:id/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const history = await paymentService.getInvoiceHistory(id);
        return res.json({ history });
    } catch (e) {
        return next(e);
    }
});

// Download invoice PDF
billingRouter.get('/invoices/:id/pdf', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const template = (req.query.template as string) || 'STANDARD';
        const pdfBuffer = await pdfService.generateInvoicePDF(id, template);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
        return res.send(pdfBuffer);
    } catch (e: any) {
        return res.status(400).json({ message: e.message || 'Failed to generate PDF' });
    }
});

// Download receipt PDF
billingRouter.get('/payments/:paymentId/receipt', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { paymentId } = req.params;
        const pdfBuffer = await pdfService.generateReceiptPDF(paymentId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentId}.pdf`);
        return res.send(pdfBuffer);
    } catch (e: any) {
        return res.status(400).json({ message: e.message || 'Failed to generate receipt' });
    }
});

// Download partial payment receipt
billingRouter.get('/payments/:paymentId/partial-receipt', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { paymentId } = req.params;
        const pdfBuffer = await pdfService.generatePartialPaymentReceipt(paymentId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=partial-payment-${paymentId}.pdf`);
        return res.send(pdfBuffer);
    } catch (e: any) {
        return res.status(400).json({ message: e.message || 'Failed to generate partial payment receipt' });
    }
});

// Create monthly invoice
billingRouter.post('/invoices/monthly', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invoice = await paymentService.createMonthlyInvoice(req.body);
        return res.status(201).json({ invoice });
    } catch (e: any) {
        return res.status(400).json({ message: e.message || 'Failed to create monthly invoice' });
    }
});

// Get invoices by month
billingRouter.get('/invoices/by-month/:month', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { month } = req.params;
        const invoices = await paymentService.getInvoicesByMonth(month);
        return res.json({ invoices });
    } catch (e) {
        return next(e);
    }
});

// --- Merged Tracking Routes ---

billingRouter.get('/invoices/:id/tracking', authenticate, async (req, res) => {
    try {
        const tracking = await trackingService.getInvoiceTracking(req.params.id);
        if (!tracking) return res.status(404).json({ message: 'Invoice tracking not found' });
        res.json(tracking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.patch('/invoices/:id/status', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });
        const updated = await trackingService.updateInvoiceTracking(req.params.id, req.userId!, status, notes);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post('/invoices/:id/reminders', authenticate, requirePermission('billing.manage'), async (req, res) => {
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

// --- Merged Template Routes ---

billingRouter.get('/templates', authenticate, async (req, res) => {
    try {
        const templates = await templateService.getTemplates();
        res.json({ templates });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post('/templates', authenticate, requirePermission('billing.manage'), async (req, res) => {
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

billingRouter.patch('/templates/:id', authenticate, requirePermission('billing.manage'), async (req, res) => {
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

billingRouter.delete('/templates/:id', authenticate, requirePermission('billing.manage'), async (req, res) => {
    try {
        await templateService.deleteTemplate(req.params.id, req.userId!);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});
