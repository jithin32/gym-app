import { Router } from 'express';
import {
  listMembers, getMember, createMember, updateMember,
  deleteMember, freezeMember, renewMember, listPlans
} from '../controllers/members.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/plans', listPlans);
router.get('/', requireRole('admin', 'coach'), listMembers);
router.post('/', requireRole('admin'), createMember);
router.get('/:id', requireRole('admin', 'coach'), getMember);
router.put('/:id', requireRole('admin'), updateMember);
router.delete('/:id', requireRole('admin'), deleteMember);
router.post('/:id/freeze', requireRole('admin', 'coach'), freezeMember);
router.post('/:id/renew', requireRole('admin', 'coach'), renewMember);

export default router;
