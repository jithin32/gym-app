import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { getNotifications, getUnreadCount, markRead, markAllRead, checkExpiringMemberships } from '../controllers/notifications.controller';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/count', authenticate, getUnreadCount);
router.post('/check-expiry', authenticate, requireRole('coach', 'admin'), checkExpiringMemberships);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markRead);

export default router;
