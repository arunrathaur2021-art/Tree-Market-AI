import { Router } from 'express';
import { processPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, processPayment);
router.get('/history', requireAuth, getPaymentHistory);

export default router;
