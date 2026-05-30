import { Router } from 'express';
import { listCoaches, getCoach, createCoach, updateCoach, deleteCoach } from '../controllers/coaches.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('admin', 'coach'), listCoaches);
router.post('/', requireRole('admin'), createCoach);
router.get('/:id', requireRole('admin', 'coach'), getCoach);
router.put('/:id', requireRole('admin'), updateCoach);
router.delete('/:id', requireRole('admin'), deleteCoach);

export default router;
