import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateStatus, getStats } from '../controllers/orderController.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

// User routes
router.post('/', auth, createOrder);
router.get('/my', auth, getMyOrders);

// Admin routes (before :id to avoid param conflict)
router.get('/admin/all', auth, admin, getAllOrders);
router.get('/admin/stats', auth, admin, getStats);

// Shared (permission check inside controller)
router.get('/:id', auth, getOrderById);

// User cancel
router.put('/:id/cancel', auth, cancelOrder);

// Admin status update
router.put('/:id/status', auth, admin, updateStatus);

export default router;
