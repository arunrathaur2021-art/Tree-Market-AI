import { Router } from 'express';
import { 
  getAlerts, createAlert, deleteAlert, 
  getNotifications, markNotificationsAsRead, 
  markSingleNotificationAsRead, deleteNotification 
} from '../controllers/alertController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getAlerts);
router.post('/', requireAuth, createAlert);
router.delete('/:id', requireAuth, deleteAlert);

router.get('/notifications', requireAuth, getNotifications);
router.put('/notifications/read', requireAuth, markNotificationsAsRead);
router.put('/notifications/read-all', requireAuth, markNotificationsAsRead);
router.put('/notifications/:id/read', requireAuth, markSingleNotificationAsRead);
router.delete('/notifications/:id', requireAuth, deleteNotification);

export default router;
