import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  resetMemberPassword: (memberId: number) =>
    api.post(`/auth/reset-password/${memberId}`),
};

// Members
export const membersApi = {
  list: (params?: object) => api.get('/members', { params }),
  get: (id: number) => api.get(`/members/${id}`),
  create: (data: object) => api.post('/members', data),
  update: (id: number, data: object) => api.put(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`),
  freeze: (id: number) => api.post(`/members/${id}/freeze`),
  renew: (id: number, data: object) => api.post(`/members/${id}/renew`, data),
  plans: () => api.get('/members/plans'),
};

// Coaches
export const coachesApi = {
  list: () => api.get('/coaches'),
  get: (id: number) => api.get(`/coaches/${id}`),
  create: (data: object) => api.post('/coaches', data),
  update: (id: number, data: object) => api.put(`/coaches/${id}`, data),
  delete: (id: number) => api.delete(`/coaches/${id}`),
};

// Attendance
export const attendanceApi = {
  mark: () => api.post('/attendance/mark'),
  status: () => api.get('/attendance/status'),
  today: () => api.get('/attendance/today'),
  memberHistory: (id: number, params?: object) => api.get(`/attendance/member/${id}`, { params }),
  report: (params?: object) => api.get('/attendance/report', { params }),
};

// Payments
export const paymentsApi = {
  list: (params?: object) => api.get('/payments', { params }),
  add: (data: object) => api.post('/payments', data),
  update: (id: number, data: object) => api.put(`/payments/${id}`, data),
  overdue: () => api.get('/payments/overdue'),
  memberPayments: (id: number) => api.get(`/payments/member/${id}`),
  revenue: () => api.get('/payments/revenue'),
};

// Dashboard
export const dashboardApi = {
  adminStats: () => api.get('/dashboard/admin'),
  coachStats: () => api.get('/dashboard/coach'),
};

// Exercises
export const exercisesApi = {
  list: (params?: object) => api.get('/exercises', { params }),
  get: (id: number) => api.get(`/exercises/${id}`),
  bodyParts: () => api.get('/exercises/body-parts'),
  create: (data: object) => api.post('/exercises', data),
  update: (id: number, data: object) => api.put(`/exercises/${id}`, data),
  delete: (id: number) => api.delete(`/exercises/${id}`),
};

// Warmups
export const warmupsApi = {
  byDay: (dayType: string) => api.get(`/warmups/${dayType}`),
  dayTypes: () => api.get('/warmups/day-types'),
};

// Measurements
export const measurementsApi = {
  forMember: (memberId: number) => api.get(`/measurements/member/${memberId}`),
  add: (data: object) => api.post('/measurements', data),
  update: (id: number, data: object) => api.put(`/measurements/${id}`, data),
  delete: (id: number) => api.delete(`/measurements/${id}`),
};

// Workout Plans
export const plansApi = {
  list: () => api.get('/plans'),
  get: (id: number) => api.get(`/plans/${id}`),
  create: (data: object) => api.post('/plans', data),
  update: (id: number, data: object) => api.put(`/plans/${id}`, data),
  delete: (id: number) => api.delete(`/plans/${id}`),
  assign: (id: number, data: object) => api.post(`/plans/${id}/assign`, data),
  memberPlan: (memberId: number) => api.get(`/plans/member/${memberId}`),
  complete: (data: object) => api.post('/plans/complete', data),
  workoutStats: (memberId: number) => api.get(`/plans/stats/${memberId}`),
};

// Progress Photos
export const photosApi = {
  list: (memberId: number) => api.get(`/photos/${memberId}`),
  upload: (memberId: number, formData: FormData) =>
    api.post(`/photos/${memberId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/photos/${id}`),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  count: () => api.get('/notifications/count'),
  checkExpiry: () => api.post('/notifications/check-expiry'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Reports
export const reportsApi = {
  heatmap: () => api.get('/reports/attendance-heatmap'),
  memberGrowth: () => api.get('/reports/member-growth'),
  workoutStats: () => api.get('/reports/workout-stats'),
};

export default api;
