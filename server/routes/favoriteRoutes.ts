import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/treeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getWishlist);
router.post('/:treeId', requireAuth, toggleWishlist);
router.delete('/:treeId', requireAuth, toggleWishlist);

export default router;
