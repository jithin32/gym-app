import { Router } from 'express';
import {
  listPlans, getPlan, createPlan, updatePlan, deletePlan,
  assignPlan, getMemberActivePlan, completeWorkout, getMemberWorkoutStats
} from '../controllers/plans.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('admin', 'coach'), listPlans);
router.post('/', requireRole('admin', 'coach'), createPlan);
router.get('/member/:memberId', getMemberActivePlan);
router.get('/stats/:memberId', getMemberWorkoutStats);
router.post('/complete', requireRole('member'), completeWorkout);
router.get('/:id', getPlan);
router.put('/:id', requireRole('admin', 'coach'), updatePlan);
router.delete('/:id', requireRole('admin', 'coach'), deletePlan);
router.post('/:id/assign', requireRole('admin', 'coach'), assignPlan);

export default router;
