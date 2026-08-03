import { Router } from 'express';
import { 
  getTrees, getTreeById, createTree, updateTree, deleteTree, 
  getWishlist, toggleWishlist, postReview 
} from '../controllers/treeController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getTrees);
router.post('/', requireAuth, createTree);
router.get('/wishlist', requireAuth, getWishlist);
router.post('/wishlist/:treeId', requireAuth, toggleWishlist);
router.get('/:id', optionalAuth, getTreeById);
router.put('/:id', requireAuth, updateTree);
router.delete('/:id', requireAuth, deleteTree);
router.post('/:treeId/review', requireAuth, postReview);

export default router;
