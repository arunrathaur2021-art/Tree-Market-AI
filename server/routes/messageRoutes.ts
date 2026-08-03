import { Router } from 'express';
import { 
  sendMessage, 
  getConversation, 
  getConversationsList,
  deleteMessage,
  toggleArchiveChat,
  blockUser,
  reportUser,
  updatePresence
} from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, sendMessage);
router.get('/conversations', requireAuth, getConversationsList);
router.get('/conversations/:partnerId', requireAuth, getConversation);
router.delete('/:messageId', requireAuth, deleteMessage);
router.post('/archive', requireAuth, toggleArchiveChat);
router.post('/block', requireAuth, blockUser);
router.post('/report', requireAuth, reportUser);
router.post('/presence', requireAuth, updatePresence);

export default router;
