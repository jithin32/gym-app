import { Router } from 'express';
import { getWarmupsByDay, listDayTypes, listAllWarmups } from '../controllers/warmups.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', listAllWarmups);
router.get('/day-types', listDayTypes);
router.get('/:dayType', getWarmupsByDay);

export default router;
