import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi } from '../../services/api';

interface AttendanceRecord {
  id: number;
  member_id: string;
  full_name: string;
  phone: string;
  coach_name: string;
  check_in: string;
}

interface AttendanceState {
  todayRecords: AttendanceRecord[];
  presentCount: number;
  totalActive: number;
  marked: boolean;
  checkIn: string | null;
  date: string;
  loading: boolean;
  marking: boolean;
}

const initialState: AttendanceState = {
  todayRecords: [],
  presentCount: 0,
  totalActive: 0,
  marked: false,
  checkIn: null,
  date: '',
  loading: false,
  marking: false,
};

export const checkStatus = createAsyncThunk('attendance/checkStatus', async () => {
  const res = await attendanceApi.status();
  return res.data as { marked: boolean; checkIn: string | null; date: string };
});

export const markAttendance = createAsyncThunk('attendance/mark', async () => {
  const res = await attendanceApi.mark();
  return res.data as { alreadyMarked: boolean; checkIn?: string; date?: string };
});

export const fetchToday = createAsyncThunk('attendance/fetchToday', async () => {
  const res = await attendanceApi.today();
  return res.data as { present: AttendanceRecord[]; presentCount: number; totalActive: number; date: string };
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkStatus.fulfilled, (state, action) => {
        state.marked = action.payload.marked;
        state.checkIn = action.payload.checkIn;
        state.date = action.payload.date;
      })
      .addCase(markAttendance.pending, (state) => { state.marking = true; })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.marking = false;
        state.marked = true;
        state.checkIn = action.payload.checkIn ?? null;
        state.date = action.payload.date ?? state.date;
      })
      .addCase(markAttendance.rejected, (state) => { state.marking = false; })
      .addCase(fetchToday.pending, (state) => { state.loading = true; })
      .addCase(fetchToday.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecords = action.payload.present;
        state.presentCount = action.payload.presentCount;
        state.totalActive = action.payload.totalActive;
        state.date = action.payload.date;
      })
      .addCase(fetchToday.rejected, (state) => { state.loading = false; });
  },
});

export default attendanceSlice.reducer;
