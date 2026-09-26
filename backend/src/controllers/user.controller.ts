import { Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

// Validation for updating user
const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['MEMBER', 'TRAINER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role: filterRole, isActive, search } = req.query;

    let whereClause: any = {};

    if (filterRole) {
      whereClause.role = filterRole as string;
    }
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { firstName: { contains: searchStr } },
        { lastName: { contains: searchStr } },
        { email: { contains: searchStr } },
        { phone: { contains: searchStr } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
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
        classes: { select: { id: true, name: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = updateUserSchema.parse(req.body);

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent removing the last admin
    if (data.role && data.role !== 'ADMIN' && userToUpdate.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last active ADMIN from the system' });
      }
    }

    if (data.isActive === false && userToUpdate.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot deactivate the last active ADMIN in the system' });
      }
    }

    if (data.email && data.email !== userToUpdate.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection for last admin
    if (userToDelete.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete/deactivate the last active ADMIN in the system' });
      }
    }

    // Instead of a hard delete which would cascade and destroy historical records (bookings, attendance, progress, workouts) 
    // or throw foreign key constraint errors because we aren't using cascade on the relations, we will use a soft delete/deactivation.
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      }
    });

    res.status(200).json({ message: 'User successfully deactivated to preserve historical records', user: deactivatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
