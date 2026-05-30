import { Router } from 'express';
import { getAdminStats, getCoachStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);
router.get('/admin', requireRole('admin'), getAdminStats);
router.get('/coach', requireRole('coach'), getCoachStats);

export default router;
