import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';

import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './features/auth/ProtectedRoute';

import AdminLayout from './components/layout/AdminLayout';
import CoachLayout from './components/layout/CoachLayout';
import MemberLayout from './components/layout/MemberLayout';

import AdminDashboard from './features/dashboard/AdminDashboard';
import CoachDashboard from './features/dashboard/CoachDashboard';

import MemberList from './features/members/MemberList';
import CoachList from './features/coaches/CoachList';

import AttendanceReport from './features/attendance/AttendanceReport';
import MarkAttendance from './features/attendance/MarkAttendance';

import FeesList from './features/fees/FeesList';

import ExerciseGalleryPage from './features/exercises/ExerciseGalleryPage';
import PlanList from './features/workoutPlans/PlanList';
import AdminReports from './features/reports/AdminReports';

import WarmupPage from './features/members/WarmupPage';
import WorkoutPage from './features/members/WorkoutPage';
import MemberProgress from './features/members/MemberProgress';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<MemberList />} />
            <Route path="coaches" element={<CoachList />} />
            <Route path="attendance" element={<AttendanceReport />} />
            <Route path="fees" element={<FeesList />} />
            <Route path="exercises" element={<ExerciseGalleryPage />} />
            <Route path="plans" element={<PlanList />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Coach routes */}
          <Route
            path="/coach"
            element={
              <ProtectedRoute allowedRoles={['coach']}>
                <CoachLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CoachDashboard />} />
            <Route path="members" element={<MemberList />} />
            <Route path="attendance" element={<AttendanceReport />} />
            <Route path="exercises" element={<ExerciseGalleryPage />} />
            <Route path="plans" element={<PlanList />} />
          </Route>

          {/* Member routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="attendance" replace />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="warmup" element={<WarmupPage />} />
            <Route path="workout" element={<WorkoutPage />} />
            <Route path="progress" element={<MemberProgress />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
