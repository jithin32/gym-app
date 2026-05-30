import { Router } from 'express';
import { login, changePassword, resetMemberPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.post('/reset-password/:memberId', authenticate, requireRole('admin'), resetMemberPassword);

export default router;
