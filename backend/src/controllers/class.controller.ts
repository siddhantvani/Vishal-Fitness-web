import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

const classSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.string().min(1),
  capacity: z.number().int().positive(),
  duration: z.number().int().positive(),
  defaultTrainerId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const classUpdateSchema = classSchema.partial();

export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        defaultTrainer: {
          select: { id: true, firstName: true, lastName: true, profileImage: true, isActive: true }
        }
      }
    });
    res.status(200).json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        defaultTrainer: {
          select: { id: true, firstName: true, lastName: true, profileImage: true, isActive: true }
        }
      }
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json(classItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const data = classSchema.parse(req.body);

    if (data.defaultTrainerId) {
      const trainer = await prisma.user.findUnique({
        where: { id: data.defaultTrainerId, role: 'TRAINER' }
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      if (!trainer.isActive) {
        return res.status(400).json({ message: 'Cannot assign an inactive trainer' });
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        capacity: data.capacity,
        duration: data.duration,
        defaultTrainerId: data.defaultTrainerId,
        isActive: data.isActive,
      }
    });

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = classUpdateSchema.parse(req.body);

    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (data.defaultTrainerId) {
      const trainer = await prisma.user.findUnique({
        where: { id: data.defaultTrainerId, role: 'TRAINER' }
      });

      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }

      if (!trainer.isActive) {
        return res.status(400).json({ message: 'Cannot assign an inactive trainer' });
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data
    });

    res.status(200).json({
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await prisma.class.delete({ where: { id } });

    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
