import { Router } from 'express';
import { getMemberMeasurements, addMeasurement, updateMeasurement, deleteMeasurement } from '../controllers/measurements.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticate);

router.get('/member/:memberId', getMemberMeasurements);
router.post('/', requireRole('admin', 'coach', 'member'), addMeasurement);
router.put('/:id', requireRole('admin', 'coach'), updateMeasurement);
router.delete('/:id', requireRole('admin', 'coach'), deleteMeasurement);

export default router;
