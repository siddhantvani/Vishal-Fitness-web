import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { hashPassword } from '../utils/auth';

const trainerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  profileImage: z.string().url().optional(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().min(0).optional(),
  availability: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const trainerUpdateSchema = trainerSchema.partial().omit({ email: true, password: true });

export const getTrainers = async (req: Request, res: Response) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        bio: true,
        specialization: true,
        experience: true,
        availability: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(trainers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainerById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const trainer = await prisma.user.findFirst({
      where: { id, role: 'TRAINER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        bio: true,
        specialization: true,
        experience: true,
        availability: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    res.status(200).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTrainer = async (req: Request, res: Response) => {
  try {
    const data = trainerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(data.password || 'defaultPassword123!');

    const trainer = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        role: 'TRAINER',
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        profileImage: data.profileImage,
        bio: data.bio,
        specialization: data.specialization,
        experience: data.experience,
        availability: data.availability,
        isActive: data.isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      message: 'Trainer created successfully',
      trainer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrainer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = trainerUpdateSchema.parse(req.body);

    const existingTrainer = await prisma.user.findFirst({
      where: { id, role: 'TRAINER' },
    });

    if (!existingTrainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const updatedTrainer = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        bio: true,
        specialization: true,
        experience: true,
        availability: true,
        isActive: true,
        updatedAt: true,
      }
    });

    res.status(200).json({
      message: 'Trainer updated successfully',
      trainer: updatedTrainer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existingTrainer = await prisma.user.findFirst({
      where: { id, role: 'TRAINER' },
    });

    if (!existingTrainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Instead of hard deleting, we could deactivate, but the prompt says DELETE /api/trainers/:id
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
