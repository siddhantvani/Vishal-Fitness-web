import { Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

const bookingSchema = z.object({
  scheduleId: z.string().uuid(),
});

const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.user!.userId;
    const { scheduleId } = bookingSchema.parse(req.body);

    // Overbooking / concurrency protection using Prisma $transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Verify schedule exists and is bookable
      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId },
        include: { class: true }
      });

      if (!schedule) {
        throw new Error('NOT_FOUND');
      }

      // Cancelled schedule protection
      if (schedule.status === 'CANCELLED') {
        throw new Error('SCHEDULE_CANCELLED');
      }

      // Past schedule protection
      if (new Date(schedule.startTime) < new Date()) {
        throw new Error('SCHEDULE_PAST');
      }

      // 2. Verify available slots > 0
      if (schedule.availableSlots <= 0) {
        throw new Error('CLASS_FULL');
      }

      // 3. Verify member does not already have an active booking
      const existingBooking = await tx.booking.findFirst({
        where: {
          memberId,
          scheduleId,
          status: { not: 'CANCELLED' }
        }
      });

      if (existingBooking) {
        throw new Error('DUPLICATE_BOOKING');
      }

      // 4. Decrease availableSlots by exactly 1
      await tx.schedule.update({
        where: { id: scheduleId },
        data: { availableSlots: { decrement: 1 } }
      });

      // 5. Create the booking
      return await tx.booking.create({
        data: {
          memberId,
          scheduleId,
          status: 'CONFIRMED' // Defaulting to CONFIRMED based on requirements
        },
        include: {
          schedule: {
            include: { class: true, trainer: { select: { firstName: true, lastName: true } } }
          }
        }
      });
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    
    switch(error.message) {
      case 'NOT_FOUND':
        return res.status(404).json({ message: 'Schedule not found' });
      case 'SCHEDULE_CANCELLED':
        return res.status(400).json({ message: 'Cannot book a cancelled schedule' });
      case 'SCHEDULE_PAST':
        return res.status(400).json({ message: 'Cannot book a past schedule' });
      case 'CLASS_FULL':
        return res.status(409).json({ message: 'Class is full' });
      case 'DUPLICATE_BOOKING':
        return res.status(409).json({ message: 'You already have an active booking for this schedule' });
      default:
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    
    let whereClause = {};
    if (role !== 'ADMIN') {
      whereClause = { memberId: userId };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        schedule: {
          include: { 
            class: { select: { name: true, type: true } }, 
            trainer: { select: { firstName: true, lastName: true } } 
          }
        },
        member: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const bookingId = req.params.id as string;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        schedule: {
          include: { 
            class: { select: { name: true, type: true, duration: true } }, 
            trainer: { select: { firstName: true, lastName: true } } 
          }
        },
        member: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ownership protection
    if (role !== 'ADMIN' && booking.memberId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const bookingId = req.params.id as string;

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { schedule: { include: { class: true } } }
      });

      if (!booking) {
        throw new Error('NOT_FOUND');
      }

      // Ownership protection
      if (role !== 'ADMIN' && booking.memberId !== userId) {
        throw new Error('FORBIDDEN');
      }

      if (booking.status === 'CANCELLED') {
        throw new Error('ALREADY_CANCELLED');
      }

      // Ensure we do not exceed class capacity when restoring the slot
      if (booking.schedule.availableSlots >= booking.schedule.class.capacity) {
         // This theoretically shouldn't happen unless data was manipulated manually, but handle it safely.
         // We'll restore it up to max capacity.
      }

      await tx.schedule.update({
        where: { id: booking.scheduleId },
        data: { 
          availableSlots: { 
            increment: booking.schedule.availableSlots < booking.schedule.class.capacity ? 1 : 0 
          } 
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });
    });

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error: any) {
    switch (error.message) {
      case 'NOT_FOUND':
        return res.status(404).json({ message: 'Booking not found' });
      case 'FORBIDDEN':
        return res.status(403).json({ message: 'Access forbidden: You do not own this booking' });
      case 'ALREADY_CANCELLED':
        return res.status(400).json({ message: 'Booking is already cancelled' });
      default:
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = req.params.id as string;
    const { status } = bookingUpdateSchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { schedule: { include: { class: true } } }
      });

      if (!booking) {
        throw new Error('NOT_FOUND');
      }

      // If status is changing TO CANCELLED from an active state, increase slot
      if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
        await tx.schedule.update({
          where: { id: booking.scheduleId },
          data: { 
            availableSlots: { 
              increment: booking.schedule.availableSlots < booking.schedule.class.capacity ? 1 : 0 
            } 
          }
        });
      }
      
      // If status is changing FROM CANCELLED to an active state, decrease slot
      if (booking.status === 'CANCELLED' && status !== 'CANCELLED') {
        if (booking.schedule.availableSlots <= 0) {
          throw new Error('CLASS_FULL');
        }
        await tx.schedule.update({
          where: { id: booking.scheduleId },
          data: { availableSlots: { decrement: 1 } }
        });
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: { status }
      });
    });

    res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }

    switch (error.message) {
      case 'NOT_FOUND':
        return res.status(404).json({ message: 'Booking not found' });
      case 'CLASS_FULL':
        return res.status(409).json({ message: 'Cannot restore booking because the class is currently full' });
      default:
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
