import { Router } from 'express';
import { 
  createOrder, getBuyerOrders, getSellerOrders, updateOrderStatus, getSellerAnalytics 
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/buyer', requireAuth, getBuyerOrders);
router.get('/seller', requireAuth, getSellerOrders);
router.get('/analytics', requireAuth, getSellerAnalytics);
router.put('/:id/status', requireAuth, updateOrderStatus);

export default router;
