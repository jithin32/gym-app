import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../services/api';

interface Notification {
  id: number;
  user_id: number;
  user_role: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsState {
  list: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = { list: [], unreadCount: 0, loading: false };

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const res = await notificationsApi.list();
  return res.data as Notification[];
});

export const fetchUnreadCount = createAsyncThunk('notifications/count', async () => {
  const res = await notificationsApi.count();
  return res.data.count as number;
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id: number) => {
  await notificationsApi.markRead(id);
  return id;
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await notificationsApi.markAllRead();
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.is_read).length;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.list.find((x) => x.id === action.payload);
        if (n && !n.is_read) { n.is_read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list.forEach((n) => { n.is_read = true; });
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
