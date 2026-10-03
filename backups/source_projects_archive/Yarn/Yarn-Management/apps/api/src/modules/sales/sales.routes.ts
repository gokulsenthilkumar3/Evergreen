import { Router } from 'express';
import * as salesOrderService from './sales-order.service';

const router = Router();

/**
 * @route POST /api/sales/orders
 * @desc Create a new sales order
 */
router.post('/orders', async (req, res) => {
    try {
        const order = await salesOrderService.createSalesOrder(req.body);
        res.status(201).json({ order });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route GET /api/sales/orders
 * @desc List sales orders with filters
 */
router.get('/orders', async (req, res) => {
    try {
        const orders = await salesOrderService.listSalesOrders(req.query);
        res.json({ orders });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/sales/orders/analytics
 * @desc Get sales order analytics summary
 */
router.get('/orders/analytics', async (req, res) => {
    try {
        const analytics = await salesOrderService.getSalesOrderAnalytics();
        res.json({ analytics });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/sales/orders/:id
 * @desc Get a single sales order by ID
 */
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await salesOrderService.getSalesOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ order });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PATCH /api/sales/orders/:id/status
 * @desc Update sales order status
 */
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const order = await salesOrderService.updateSalesOrderStatus(req.params.id, req.body.status);
        res.json({ order });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/sales/orders/:id/packing-list
 * @desc Generate packing list for an order
 */
router.post('/orders/:id/packing-list', async (req, res) => {
    try {
        const packingList = await salesOrderService.createPackingList(req.params.id, req.body);
        res.status(201).json({ packingList });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/sales/orders/:id/delivery-note
 * @desc Generate delivery note for an order
 */
router.post('/orders/:id/delivery-note', async (req, res) => {
    try {
        const deliveryNote = await salesOrderService.createDeliveryNote(req.params.id, req.body);
        res.status(201).json({ deliveryNote });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
