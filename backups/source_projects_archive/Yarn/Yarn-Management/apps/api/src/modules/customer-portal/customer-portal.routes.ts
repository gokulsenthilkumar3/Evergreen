import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as customerPortalService from './customer-portal.service';

const customerPortalRouter = Router();

/**
 * Middleware to ensure user is a customer
 */
const requireCustomer = async (req: Request, res: Response, next: any) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { prisma } = await import('../../prisma/client');
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { customerId: true },
        });

        if (!user?.customerId) {
            return res.status(403).json({ message: 'Access denied: Not a customer user' });
        }

        // Attach customerId to request for easy access
        (req as any).customerId = user.customerId;
        next();
    } catch (error) {
        console.error('Error in requireCustomer middleware:', error);
        res.status(500).json({ message: 'Server error checking permissions' });
    }
};

/**
 * GET /customer-portal/dashboard
 * Get dashboard statistics
 */
customerPortalRouter.get(
    '/dashboard',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;

            const [stats, recentOrders] = await Promise.all([
                customerPortalService.getDashboardStats(customerId),
                customerPortalService.getRecentOrders(customerId, 5),
            ]);

            res.json({ stats, recentOrders });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    }
);

/**
 * GET /customer-portal/orders
 * List sales orders with pagination
 */
customerPortalRouter.get(
    '/orders',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            const result = await customerPortalService.getSalesOrders(customerId, {
                page,
                limit,
                status,
            });

            res.json(result);
        } catch (error) {
            console.error('Orders list error:', error);
            res.status(500).json({ message: 'Failed to fetch orders' });
        }
    }
);

/**
 * GET /customer-portal/orders/:id
 * Get single order details
 */
customerPortalRouter.get(
    '/orders/:id',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;
            const { id } = req.params;

            const order = await customerPortalService.getSalesOrderById(customerId, id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json({ order });
        } catch (error) {
            console.error('Order detail error:', error);
            res.status(500).json({ message: 'Failed to fetch order details' });
        }
    }
);

/**
 * GET /customer-portal/invoices
 * List invoices with pagination
 */
customerPortalRouter.get(
    '/invoices',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            const result = await customerPortalService.getInvoices(customerId, {
                page,
                limit,
                status,
            });

            res.json(result);
        } catch (error) {
            console.error('Invoices list error:', error);
            res.status(500).json({ message: 'Failed to fetch invoices' });
        }
    }
);

/**
 * GET /customer-portal/invoices/:id
 * Get single invoice details
 */
customerPortalRouter.get(
    '/invoices/:id',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;
            const { id } = req.params;

            const invoice = await customerPortalService.getInvoiceById(customerId, id);

            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }

            res.json({ invoice });
        } catch (error) {
            console.error('Invoice detail error:', error);
            res.status(500).json({ message: 'Failed to fetch invoice details' });
        }
    }
);

/**
 * GET /customer-portal/account
 * Get customer account information
 */
customerPortalRouter.get(
    '/account',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;

            const account = await customerPortalService.getCustomerAccount(customerId);

            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }

            res.json({ account });
        } catch (error) {
            console.error('Account error:', error);
            res.status(500).json({ message: 'Failed to fetch account information' });
        }
    }
);

/**
 * PUT /customer-portal/account
 * Update customer account information
 */
customerPortalRouter.put(
    '/account',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;
            const { email, phone, notes } = req.body;

            const account = await customerPortalService.updateCustomerAccount(customerId, {
                email,
                phone,
                notes,
            });

            res.json({ account, message: 'Account updated successfully' });
        } catch (error) {
            console.error('Account update error:', error);
            res.status(500).json({ message: 'Failed to update account' });
        }
    }
);

/**
 * GET /customer-portal/payments
 * Get payment history
 */
customerPortalRouter.get(
    '/payments',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;

            const payments = await customerPortalService.getPaymentHistory(customerId);

            res.json({ payments });
        } catch (error) {
            console.error('Payment history error:', error);
            res.status(500).json({ message: 'Failed to fetch payment history' });
        }
    }
);

/**
 * GET /customer-portal/support/tickets
 * Get support tickets
 */
customerPortalRouter.get(
    '/support/tickets',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;

            const tickets = await customerPortalService.getSupportTickets(customerId);

            res.json({ tickets });
        } catch (error) {
            console.error('Support tickets error:', error);
            res.status(500).json({ message: 'Failed to fetch support tickets' });
        }
    }
);

/**
 * POST /customer-portal/support/tickets
 * Create a support ticket
 */
customerPortalRouter.post(
    '/support/tickets',
    authenticate,
    requireCustomer,
    async (req: Request, res: Response) => {
        try {
            const customerId = (req as any).customerId;
            const { title, description, category, priority } = req.body;

            if (!title || !description) {
                return res.status(400).json({ message: 'Title and description are required' });
            }

            const result = await customerPortalService.createSupportTicket(customerId, {
                title,
                description,
                category,
                priority,
            });

            res.json(result);
        } catch (error) {
            console.error('Create ticket error:', error);
            res.status(500).json({ message: 'Failed to create support ticket' });
        }
    }
);

export { customerPortalRouter };
