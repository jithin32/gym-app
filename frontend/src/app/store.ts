import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import membersReducer from '../features/members/membersSlice';
import coachesReducer from '../features/coaches/coachesSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import feesReducer from '../features/fees/feesSlice';
import exercisesReducer from '../features/exercises/exercisesSlice';
import measurementsReducer from '../features/measurements/measurementsSlice';
import plansReducer from '../features/workoutPlans/plansSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    coaches: coachesReducer,
    attendance: attendanceReducer,
    fees: feesReducer,
    exercises: exercisesReducer,
    measurements: measurementsReducer,
    plans: plansReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
