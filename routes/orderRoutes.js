import { Router } from 'express';
import { getOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { getPayment, createPayment } from '../controllers/paymentController.js';

const router = Router();

router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/orders/:orderId/payment', getPayment);
router.post('/orders/:orderId/payment', createPayment);

export default router;
