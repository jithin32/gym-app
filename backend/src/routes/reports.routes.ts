import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { getAttendanceHeatmap, getMemberGrowth, getWorkoutStats } from '../controllers/reports.controller';

const router = Router();

router.get('/attendance-heatmap', authenticate, requireRole('admin'), getAttendanceHeatmap);
router.get('/member-growth', authenticate, requireRole('admin'), getMemberGrowth);
router.get('/workout-stats', authenticate, requireRole('admin', 'coach'), getWorkoutStats);

export default router;
