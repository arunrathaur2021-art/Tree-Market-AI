import { Router } from 'express';
import { 
  getAdminStats, approveTreeListing, deleteListingByAdmin, 
  getManageUsersList, deleteUserByAdmin 
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAuth, getAdminStats);
router.put('/trees/:id/approve', requireAuth, approveTreeListing);
router.delete('/trees/:id', requireAuth, deleteListingByAdmin);
router.get('/users', requireAuth, getManageUsersList);
router.delete('/users/:id', requireAuth, deleteUserByAdmin);

export default router;
