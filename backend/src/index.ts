import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import memberRoutes from './routes/members.routes';
import coachRoutes from './routes/coaches.routes';
import attendanceRoutes from './routes/attendance.routes';
import paymentRoutes from './routes/payments.routes';
import dashboardRoutes from './routes/dashboard.routes';
import exerciseRoutes from './routes/exercises.routes';
import warmupRoutes from './routes/warmups.routes';
import measurementRoutes from './routes/measurements.routes';
import planRoutes from './routes/plans.routes';
import photoRoutes from './routes/photos.routes';
import notificationRoutes from './routes/notifications.routes';
import reportRoutes from './routes/reports.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/warmups', warmupRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Aditya Gym API running on http://localhost:${PORT}`);
});
