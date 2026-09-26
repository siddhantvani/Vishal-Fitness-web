import { Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

const progressSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  bodyFatPercentage: z.number().nonnegative().max(100).optional(),
  chest: z.number().nonnegative().optional(),
  waist: z.number().nonnegative().optional(),
  hips: z.number().nonnegative().optional(),
  arms: z.number().nonnegative().optional(),
  thighs: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
  recordedAt: z.string().datetime().optional()
});

const progressUpdateSchema = progressSchema.partial();

const checkTrainerAccess = async (trainerId: string, memberId: string) => {
  // Check if trainer is associated via Workout
  const workout = await prisma.workout.findFirst({
    where: { trainerId, memberId }
  });
  if (workout) return true;

  // Check if trainer is associated via Schedule/Booking
  const schedule = await prisma.schedule.findFirst({
    where: {
      trainerId,
      bookings: { some: { memberId } }
    }
  });
  return !!schedule;
};

export const createProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    if (role !== 'MEMBER') {
      return res.status(403).json({ message: 'Only members can create progress records' });
    }

    const data = progressSchema.parse(req.body);

    const progress = await prisma.progress.create({
      data: {
        ...data,
        memberId: userId,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date()
      }
    });

    res.status(201).json({ message: 'Progress recorded successfully', progress });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const targetMemberId = req.query.memberId as string;

    let whereClause: any = {};

    if (role === 'MEMBER') {
      whereClause = { memberId: userId };
    } else if (role === 'TRAINER') {
      if (!targetMemberId) {
        return res.status(400).json({ message: 'Trainer must specify memberId to query progress' });
      }
      const hasAccess = await checkTrainerAccess(userId, targetMemberId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access forbidden: You are not associated with this member' });
      }
      whereClause = { memberId: targetMemberId };
    } else if (role === 'ADMIN') {
      if (targetMemberId) {
        whereClause = { memberId: targetMemberId };
      }
    }

    const progressList = await prisma.progress.findMany({
      where: whereClause,
      include: {
        member: { select: { firstName: true, lastName: true } }
      },
      orderBy: { recordedAt: 'desc' }
    });

    res.status(200).json(progressList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProgressById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    const progress = await prisma.progress.findUnique({
      where: { id },
      include: { member: { select: { firstName: true, lastName: true } } }
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    if (role === 'MEMBER' && progress.memberId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this progress record' });
    } else if (role === 'TRAINER') {
      const hasAccess = await checkTrainerAccess(userId, progress.memberId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access forbidden: You are not associated with this member' });
      }
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    if (role === 'TRAINER') {
      return res.status(403).json({ message: 'Trainers have read-only access to progress records' });
    }

    const data = progressUpdateSchema.parse(req.body);

    const progress = await prisma.progress.findUnique({ where: { id } });
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    if (role === 'MEMBER' && progress.memberId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this progress record' });
    }

    const updatedProgress = await prisma.progress.update({
      where: { id },
      data: {
        ...data,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined
      }
    });

    res.status(200).json({ message: 'Progress updated successfully', progress: updatedProgress });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    if (role === 'TRAINER') {
      return res.status(403).json({ message: 'Trainers have read-only access to progress records' });
    }

    const progress = await prisma.progress.findUnique({ where: { id } });
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    if (role === 'MEMBER' && progress.memberId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this progress record' });
    }

    await prisma.progress.delete({ where: { id } });

    res.status(200).json({ message: 'Progress record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
