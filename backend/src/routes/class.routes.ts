import { Router } from 'express';
import { getClasses, getClassById, createClass, updateClass, deleteClass } from '../controllers/class.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getClasses);
router.get('/:id', getClassById);

// Admin-protected routes
router.post('/', authenticate, authorize(['ADMIN']), createClass);
router.patch('/:id', authenticate, authorize(['ADMIN']), updateClass);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteClass);

export default router;
