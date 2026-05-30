import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications, getUnreadCount, markRead, markAllRead } from '../controllers/notifications.controller';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/count', authenticate, getUnreadCount);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markRead);

export default router;
