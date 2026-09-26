import { Router } from 'express';
import { getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule } from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getSchedules);
router.get('/:id', getScheduleById);

// Admin-protected routes
router.post('/', authenticate, authorize(['ADMIN']), createSchedule);
router.patch('/:id', authenticate, authorize(['ADMIN']), updateSchedule);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteSchedule);

export default router;
