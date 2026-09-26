import { Router } from 'express';
import { 
  createWorkout, getWorkouts, getWorkoutById, updateWorkout, deleteWorkout,
  addExercise, updateExercise, deleteExercise 
} from '../controllers/workout.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Workouts
router.get('/', authenticate, getWorkouts);
router.get('/:id', authenticate, getWorkoutById);

// Trainer/Admin operations
router.post('/', authenticate, authorize(['TRAINER', 'ADMIN']), createWorkout);
router.patch('/:id', authenticate, authorize(['TRAINER', 'ADMIN']), updateWorkout);
router.delete('/:id', authenticate, authorize(['TRAINER', 'ADMIN']), deleteWorkout);

// Exercises
router.post('/:id/exercises', authenticate, authorize(['TRAINER', 'ADMIN']), addExercise);
router.patch('/:id/exercises/:exerciseId', authenticate, authorize(['TRAINER', 'ADMIN']), updateExercise);
router.delete('/:id/exercises/:exerciseId', authenticate, authorize(['TRAINER', 'ADMIN']), deleteExercise);

export default router;
