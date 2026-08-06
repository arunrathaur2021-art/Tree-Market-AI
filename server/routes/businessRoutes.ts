import { Router } from 'express';
import {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  addBusinessReview,
  toggleBusinessVerify,
  getAIBusinessRecommendations
} from '../controllers/businessController.js';

const router = Router();

router.get('/', getBusinesses);
router.get('/:id', getBusinessById);
router.post('/', createBusiness);
router.put('/:id', updateBusiness);
router.post('/:id/reviews', addBusinessReview);
router.put('/:id/verify', toggleBusinessVerify);
router.post('/ai-recommendations', getAIBusinessRecommendations);

export default router;
