import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, uploadPhoto, getPhotos, deletePhoto } from '../controllers/photos.controller';

const router = Router();

router.get('/:memberId', authenticate, getPhotos);
router.post('/:memberId', authenticate, upload.single('photo'), uploadPhoto);
router.delete('/:id', authenticate, deletePhoto);

export default router;
