import { Router } from 'express';
import { getReviewsByTreeId, postReview } from '../controllers/treeController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:treeId', optionalAuth, getReviewsByTreeId);
router.post('/', requireAuth, postReview);
router.post('/:treeId', requireAuth, postReview);

export default router;
