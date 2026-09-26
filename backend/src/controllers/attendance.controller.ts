import { Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

const attendanceSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
  checkInTime: z.string().datetime(),
  checkOutTime: z.string().datetime().optional(),
  notes: z.string().optional()
}).refine(data => {
  if (data.checkOutTime) {
    return new Date(data.checkInTime) <= new Date(data.checkOutTime);
  }
  return true;
}, {
  message: 'checkOutTime must not be earlier than checkInTime',
  path: ['checkOutTime']
});

const attendanceUpdateSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']).optional(),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  notes: z.string().optional()
}).refine(data => {
  if (data.checkInTime && data.checkOutTime) {
    return new Date(data.checkInTime) <= new Date(data.checkOutTime);
  }
  return true;
}, {
  message: 'checkOutTime must not be earlier than checkInTime',
  path: ['checkOutTime']
});

export const createAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    if (role === 'MEMBER') {
      return res.status(403).json({ message: 'Members cannot create attendance records' });
    }

    const data = attendanceSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { schedule: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot mark attendance for a cancelled booking' });
    }

    if (role === 'TRAINER' && booking.schedule.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You are not the trainer for this schedule' });
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { bookingId: data.bookingId }
    });

    if (existingAttendance) {
      return res.status(409).json({ message: 'Attendance already recorded for this booking' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        bookingId: data.bookingId,
        memberId: booking.memberId,
        scheduleId: booking.scheduleId,
        status: data.status,
        checkInTime: new Date(data.checkInTime),
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
        notes: data.notes
      }
    });

    res.status(201).json({ message: 'Attendance recorded successfully', attendance });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;

    let whereClause = {};

    if (role === 'MEMBER') {
      whereClause = { memberId: userId };
    } else if (role === 'TRAINER') {
      whereClause = { schedule: { trainerId: userId } };
    }

    const attendanceList = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        member: { select: { firstName: true, lastName: true } },
        schedule: { include: { class: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(attendanceList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendanceById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        member: { select: { firstName: true, lastName: true } },
        schedule: { include: { class: { select: { name: true } } } }
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (role === 'MEMBER' && attendance.memberId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this attendance record' });
    }

    if (role === 'TRAINER' && attendance.schedule.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You are not authorized to view this record' });
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    if (role === 'MEMBER') {
      return res.status(403).json({ message: 'Members cannot update attendance records' });
    }

    const data = attendanceUpdateSchema.parse(req.body);

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: { schedule: true }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (role === 'TRAINER' && attendance.schedule.trainerId !== userId) {
      return res.status(403).json({ message: 'Access forbidden: You are not authorized to update this record' });
    }

    // Secondary date validation if only one date is updated
    if (data.checkInTime || data.checkOutTime) {
      const finalCheckIn = data.checkInTime ? new Date(data.checkInTime) : attendance.checkInTime;
      const finalCheckOut = data.checkOutTime ? new Date(data.checkOutTime) : attendance.checkOutTime;
      if (finalCheckOut && finalCheckIn > finalCheckOut) {
        return res.status(400).json({ message: 'Validation error', errors: [{ path: ['checkOutTime'], message: 'checkOutTime must not be earlier than checkInTime' }] });
      }
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
        notes: data.notes
      }
    });

    res.status(200).json({ message: 'Attendance updated successfully', attendance: updatedAttendance });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const id = req.params.id as string;

    if (role === 'MEMBER') {
      return res.status(403).json({ message: 'Members cannot delete attendance records' });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: { schedule: true }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (role === 'TRAINER') {
        // According to requirements, trainers shouldn't bypass things. Can they delete? The prompt implies Admin manages deletion mostly, but says "Trainer cannot: modify attendance belonging to unrelated classes". 
        // We will restrict deletion to ADMIN to be safe, or allow it for Trainer if they own the schedule. Let's allow if they own the schedule.
        if (attendance.schedule.trainerId !== userId) {
            return res.status(403).json({ message: 'Access forbidden: You are not authorized to delete this record' });
        }
    }

    await prisma.attendance.delete({ where: { id } });

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
