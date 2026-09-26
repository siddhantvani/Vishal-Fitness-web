import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

const scheduleSchema = z.object({
  classId: z.string().uuid(),
  trainerId: z.string().uuid(),
  date: z.string().datetime(),
  day: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.string().optional().default('ACTIVE'),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime']
});

const scheduleUpdateSchema = z.object({
  classId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
  day: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.string().optional(),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return new Date(data.endTime) > new Date(data.startTime);
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        class: { select: { name: true, type: true, duration: true, capacity: true } },
        trainer: { select: { firstName: true, lastName: true, profileImage: true } }
      }
    });
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const scheduleItem = await prisma.schedule.findUnique({
      where: { id },
      include: {
        class: { select: { name: true, type: true, duration: true, capacity: true } },
        trainer: { select: { firstName: true, lastName: true, profileImage: true } }
      }
    });

    if (!scheduleItem) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json(scheduleItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const data = scheduleSchema.parse(req.body);

    const classItem = await prisma.class.findUnique({ where: { id: data.classId } });
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const trainer = await prisma.user.findUnique({ where: { id: data.trainerId, role: 'TRAINER' } });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    if (!trainer.isActive) {
      return res.status(400).json({ message: 'Cannot assign an inactive trainer' });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        classId: data.classId,
        trainerId: data.trainerId,
        date: new Date(data.date),
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        availableSlots: classItem.capacity, // Initialize availableSlots to class capacity
        status: data.status
      }
    });

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: newSchedule
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = scheduleUpdateSchema.parse(req.body);

    const existingSchedule = await prisma.schedule.findUnique({ where: { id } });
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (data.classId) {
      const classItem = await prisma.class.findUnique({ where: { id: data.classId } });
      if (!classItem) {
        return res.status(404).json({ message: 'Class not found' });
      }
    }

    if (data.trainerId) {
      const trainer = await prisma.user.findUnique({ where: { id: data.trainerId, role: 'TRAINER' } });
      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }
      if (!trainer.isActive) {
        return res.status(400).json({ message: 'Cannot assign an inactive trainer' });
      }
    }

    // If changing start/end time independently, ensure new time is valid against existing time
    const newStartTime = data.startTime ? new Date(data.startTime) : existingSchedule.startTime;
    const newEndTime = data.endTime ? new Date(data.endTime) : existingSchedule.endTime;

    if (newEndTime <= newStartTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        classId: data.classId,
        trainerId: data.trainerId,
        date: data.date ? new Date(data.date) : undefined,
        day: data.day,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        status: data.status
      }
    });

    res.status(200).json({
      message: 'Schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existingSchedule = await prisma.schedule.findUnique({ where: { id } });
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await prisma.schedule.delete({ where: { id } });

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
