import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { z } from 'zod';

const portalRouter = Router();

// Middleware to ensure user is a supplier
const requireSupplier = async (req: Request, res: Response, next: any) => {
    try {
        if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { supplierId: true }
        });

        if (!user?.supplierId) {
            return res.status(403).json({ message: 'Access denied: Not a supplier user' });
        }

        // Attach supplierId to request for easy access
        (req as any).supplierId = user.supplierId;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking permissions' });
    }
};

// Get all orders for the logged-in supplier
portalRouter.get('/orders', authenticate, requireSupplier, async (req: Request, res: Response) => {
    try {
        const supplierId = (req as any).supplierId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await prisma.$transaction([
            prisma.purchaseOrder.findMany({
                where: { supplierId },
                include: {
                    items: true,
                    _count: { select: { items: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.purchaseOrder.count({ where: { supplierId } })
        ]);

        res.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get single order details
portalRouter.get('/orders/:id', authenticate, requireSupplier, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { supplierId: true } });
        if (!user || !user.supplierId) return res.status(403).json({ message: 'Not a supplier user' });

        const supplierId = user.supplierId;
        const { id } = req.params;

        const order = await prisma.purchaseOrder.findFirst({
            where: { id, supplierId },
            include: {
                items: true,
                comments: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' }
                },
                documents: true
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
});

// Acknowledge Order
portalRouter.post('/orders/:id/acknowledge', authenticate, requireSupplier, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { supplierId: true } });
        if (!user || !user.supplierId) return res.status(403).json({ message: 'Not a supplier user' });

        const supplierId = user.supplierId;

        const order = await prisma.purchaseOrder.findFirst({ where: { id, supplierId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'SENT') {
            return res.status(400).json({ message: 'Order cannot be confirmed in current status' });
        }

        const updated = await prisma.purchaseOrder.update({
            where: { id },
            data: { status: 'CONFIRMED' }
        });

        res.json({ message: 'Order acknowledged', order: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to acknowledge order' });
    }
});

// Post Comment
portalRouter.post('/orders/:id/comments', authenticate, requireSupplier, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) return res.status(400).json({ message: 'Message is required' });

        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { supplierId: true } });
        if (!user || !user.supplierId) return res.status(403).json({ message: 'Not a supplier user' });

        const supplierId = user.supplierId;

        const order = await prisma.purchaseOrder.findFirst({ where: { id, supplierId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const comment = await prisma.pOComment.create({
            data: {
                purchaseOrderId: id,
                userId: req.userId!,
                message
            },
            include: { user: { select: { name: true } } } // Return user name immediately
        });

        res.json({ comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to post comment' });
    }
});

// Upload Document (Stub - normally would handle file upload)
// Expecting { type: 'INVOICE' | 'PACKING_SLIP', url: '...' } 
// In a real app, use multer to upload to S3/Blob storage, then save URL here.
portalRouter.post('/orders/:id/documents', authenticate, requireSupplier, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, url } = req.body;

        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { supplierId: true } });
        if (!user || !user.supplierId) return res.status(403).json({ message: 'Not a supplier user' });

        const supplierId = user.supplierId;

        const order = await prisma.purchaseOrder.findFirst({ where: { id, supplierId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const doc = await prisma.pODocument.create({
            data: {
                purchaseOrderId: id,
                type,
                url,
                uploadedByUserId: req.userId!
            }
        });

        res.json({ document: doc });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save document info' });
    }
});

export const portalRouterExport = portalRouter;
