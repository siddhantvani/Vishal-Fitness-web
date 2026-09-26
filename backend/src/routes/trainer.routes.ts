import { Router } from 'express';
import { getTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer } from '../controllers/trainer.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getTrainers);
router.get('/:id', getTrainerById);

// Admin-protected routes
router.post('/', authenticate, authorize(['ADMIN']), createTrainer);
router.patch('/:id', authenticate, authorize(['ADMIN']), updateTrainer);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteTrainer);

export default router;
