import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Express and Prisma
const app = express();
export const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) if desired, 
    // but typically we restrict it. Let's allow if origin is in the allowed list or if no origin (for local testing/mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Vishal Fitness API is running' });
});

import authRoutes from './routes/auth.routes';
import trainerRoutes from './routes/trainer.routes';
import classRoutes from './routes/class.routes';
import scheduleRoutes from './routes/schedule.routes';
import bookingRoutes from './routes/booking.routes';
import workoutRoutes from './routes/workout.routes';
import progressRoutes from './routes/progress.routes';
import attendanceRoutes from './routes/attendance.routes';
import userRoutes from './routes/user.routes';

// Import and use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
