import { Router } from 'express';
import {
  markAttendance, getTodayAttendance, getMemberAttendance,
  getMonthlyReport, checkTodayStatus
} from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.post('/mark', requireRole('member'), markAttendance);
router.get('/status', requireRole('member'), checkTodayStatus);
router.get('/today', requireRole('admin', 'coach'), getTodayAttendance);
router.get('/report', requireRole('admin', 'coach'), getMonthlyReport);
router.get('/member/:id', getMemberAttendance);

export default router;
