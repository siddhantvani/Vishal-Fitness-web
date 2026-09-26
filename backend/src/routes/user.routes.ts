import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All user management routes strictly require ADMIN role
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
