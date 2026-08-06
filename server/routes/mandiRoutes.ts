import { Router } from 'express';
import { getMandiPrices, getMandiHistory, getAIMandiAnalysis } from '../controllers/mandiController.js';

const router = Router();

router.get('/prices', getMandiPrices);
router.get('/history', getMandiHistory);
router.post('/ai-analysis', getAIMandiAnalysis);

export default router;
