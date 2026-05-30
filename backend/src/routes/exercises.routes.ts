import { Router } from 'express';
import { listExercises, getExercise, createExercise, updateExercise, deleteExercise, listBodyParts } from '../controllers/exercises.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticate);

router.get('/body-parts', listBodyParts);
router.get('/', listExercises);
router.get('/:id', getExercise);
router.post('/', requireRole('admin', 'coach'), createExercise);
router.put('/:id', requireRole('admin', 'coach'), updateExercise);
router.delete('/:id', requireRole('admin', 'coach'), deleteExercise);

export default router;
