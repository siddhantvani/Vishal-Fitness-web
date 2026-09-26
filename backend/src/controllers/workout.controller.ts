import { Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

const workoutSchema = z.object({
  title: z.string().min(1),
  memberId: z.string().uuid(),
  description: z.string().optional(),
  goal: z.string().optional(),
  duration: z.number().int().positive().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional().default('BEGINNER'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional().default('ACTIVE'),
});

const workoutUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  goal: z.string().optional(),
  duration: z.number().int().positive().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

const exerciseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sets: z.number().int().nonnegative().max(100).default(0),
  repetitions: z.number().int().nonnegative().max(1000).default(0),
  duration: z.number().int().nonnegative().optional(), // seconds
  restTime: z.number().int().nonnegative().optional(), // seconds
  order: z.number().int().positive(),
  notes: z.string().optional(),
});

const exerciseUpdateSchema = exerciseSchema.partial();

export const createWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const data = workoutSchema.parse(req.body);

    const member = await prisma.user.findUnique({ where: { id: data.memberId, role: 'MEMBER' } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found or user is not a member' });
    }

    const newWorkout = await prisma.workout.create({
      data: {
        title: data.title,
        description: data.description,
        goal: data.goal,
        duration: data.duration,
        difficulty: data.difficulty,
        status: data.status,
        memberId: data.memberId,
        trainerId: userId,
      }
    });

    res.status(201).json({ message: 'Workout created successfully', workout: newWorkout });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkouts = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    
    let whereClause = {};
    if (role === 'MEMBER') {
      whereClause = { memberId: userId };
    } else if (role === 'TRAINER') {
      whereClause = { trainerId: userId };
    }

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      include: {
        member: { select: { firstName: true, lastName: true } },
        trainer: { select: { firstName: true, lastName: true } },
        exercises: { orderBy: { order: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(workouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkoutById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        member: { select: { firstName: true, lastName: true } },
        trainer: { select: { firstName: true, lastName: true } },
        exercises: { orderBy: { order: 'asc' } }
      }
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (role === 'MEMBER' && workout.memberId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this workout plan' });
    }

    if (role === 'TRAINER' && workout.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You did not create this workout plan' });
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;
    const data = workoutUpdateSchema.parse(req.body);

    const workout = await prisma.workout.findUnique({ where: { id } });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (role === 'TRAINER' && workout.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You did not create this workout plan' });
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data
    });

    res.status(200).json({ message: 'Workout updated successfully', workout: updatedWorkout });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    const workout = await prisma.workout.findUnique({ where: { id } });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (role === 'TRAINER' && workout.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You did not create this workout plan' });
    }

    await prisma.workout.delete({ where: { id } });

    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addExercise = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const workoutId = req.params.id as string;
    const data = exerciseSchema.parse(req.body);

    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (role === 'TRAINER' && workout.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You did not create this workout plan' });
    }

    const exercise = await prisma.workoutExercise.create({
      data: {
        ...data,
        workoutId
      }
    });

    res.status(201).json({ message: 'Exercise added successfully', exercise });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateExercise = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const workoutId = req.params.id as string;
    const exerciseId = req.params.exerciseId as string;
    const data = exerciseUpdateSchema.parse(req.body);

    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (role === 'TRAINER' && workout.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You did not create this workout plan' });
    }

    const existingExercise = await prisma.workoutExercise.findFirst({
      where: { id: exerciseId, workoutId }
    });

    if (!existingExercise) {
      return res.status(404).json({ message: 'Exercise not found in this workout' });
    }

    const updatedExercise = await prisma.workoutExercise.update({
      where: { id: exerciseId },
      data
    });

    res.status(200).json({ message: 'Exercise updated successfully', exercise: updatedExercise });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteExercise = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const workoutId = req.params.id as string;
    const exerciseId = req.params.exerciseId as string;

    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (role === 'TRAINER' && workout.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You did not create this workout plan' });
    }

    const existingExercise = await prisma.workoutExercise.findFirst({
      where: { id: exerciseId, workoutId }
    });

    if (!existingExercise) {
      return res.status(404).json({ message: 'Exercise not found in this workout' });
    }

    await prisma.workoutExercise.delete({ where: { id: exerciseId } });

    res.status(200).json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
