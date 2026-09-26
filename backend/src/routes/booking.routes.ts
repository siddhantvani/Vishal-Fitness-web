import { Router } from 'express';
import { createBooking, getBookings, getBookingById, cancelBooking, updateBookingStatus } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Member and Admin routes (Admin can see all, Member sees own)
router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBookingById);

// Member create booking
router.post('/', authenticate, createBooking);

// Member cancel booking
router.patch('/:id/cancel', authenticate, cancelBooking);

// Admin update booking status
router.patch('/:id/status', authenticate, authorize(['ADMIN']), updateBookingStatus);

export default router;
