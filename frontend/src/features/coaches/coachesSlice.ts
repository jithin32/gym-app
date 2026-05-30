import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coachesApi } from '../../services/api';

export interface Coach {
  id: number;
  coach_id: string;
  full_name: string;
  phone: string;
  email: string;
  specialty: string;
  experience_yr: number;
  member_count: number;
}

interface CoachesState {
  list: Coach[];
  loading: boolean;
  error: string | null;
}

const initialState: CoachesState = { list: [], loading: false, error: null };

export const fetchCoaches = createAsyncThunk('coaches/fetchAll', async () => {
  const res = await coachesApi.list();
  return res.data as Coach[];
});

export const createCoach = createAsyncThunk(
  'coaches/create',
  async (data: object, { rejectWithValue }) => {
    try {
      const res = await coachesApi.create(data);
      return res.data as Coach;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Create failed');
    }
  }
);

export const updateCoach = createAsyncThunk(
  'coaches/update',
  async ({ id, data }: { id: number; data: object }) => {
    const res = await coachesApi.update(id, data);
    return res.data as Coach;
  }
);

export const deleteCoach = createAsyncThunk(
  'coaches/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await coachesApi.delete(id);
      return id;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Delete failed');
    }
  }
);

const coachesSlice = createSlice({
  name: 'coaches',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoaches.pending, (state) => { state.loading = true; })
      .addCase(fetchCoaches.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchCoaches.rejected, (state, action) => { state.loading = false; state.error = String(action.error.message); })
      .addCase(createCoach.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateCoach.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deleteCoach.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default coachesSlice.reducer;
