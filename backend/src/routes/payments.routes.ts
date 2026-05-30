import { Router } from 'express';
import {
  listPayments, addPayment, updatePayment, getOverdue,
  getMemberPayments, getMonthlyRevenue
} from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('admin'), listPayments);
router.post('/', requireRole('admin'), addPayment);
router.get('/overdue', requireRole('admin'), getOverdue);
router.get('/revenue', requireRole('admin'), getMonthlyRevenue);
router.get('/member/:id', getMemberPayments);
router.put('/:id', requireRole('admin'), updatePayment);

export default router;
