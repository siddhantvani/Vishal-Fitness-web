import { Router } from 'express';
import { 
  createProgress, getProgress, getProgressById, updateProgress, deleteProgress 
} from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createProgress);
router.get('/', getProgress);
router.get('/:id', getProgressById);
router.patch('/:id', updateProgress);
router.delete('/:id', deleteProgress);

export default router;
