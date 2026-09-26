import { Router } from 'express';
import { 
  createAttendance, getAttendance, getAttendanceById, updateAttendance, deleteAttendance
} from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createAttendance);
router.get('/', getAttendance);
router.get('/:id', getAttendanceById);
router.patch('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;
