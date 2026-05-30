import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { plansApi } from '../../services/api';

export interface PlanExercise {
  id: number;
  exercise_id: number;
  exercise_name: string;
  body_part: string;
  difficulty: string;
  equipment: string;
  how_to_do: string;
  muscles_targeted: string;
  sets: number;
  reps: string;
  suggested_weight: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  created_by: number;
  coach_name: string;
  exercise_count: number;
  created_at: string;
  exercises?: PlanExercise[];
}

export interface MemberPlan {
  id: number;
  plan_id: number;
  plan_name: string;
  day_label: string;
  assigned_at: string;
  exercises: PlanExercise[];
}

interface PlansState {
  list: WorkoutPlan[];
  memberPlan: MemberPlan | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlansState = { list: [], memberPlan: null, loading: false, error: null };

export const fetchPlans = createAsyncThunk('plans/fetchAll', async () => {
  const res = await plansApi.list();
  return res.data as WorkoutPlan[];
});

export const createPlan = createAsyncThunk('plans/create', async (data: object, { rejectWithValue }) => {
  try {
    const res = await plansApi.create(data);
    return res.data as WorkoutPlan;
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(e.response?.data?.message ?? 'Failed');
  }
});

export const updatePlan = createAsyncThunk('plans/update', async ({ id, data }: { id: number; data: object }) => {
  const res = await plansApi.update(id, data);
  return res.data as WorkoutPlan;
});

export const deletePlan = createAsyncThunk('plans/delete', async (id: number) => {
  await plansApi.delete(id);
  return id;
});

export const assignPlan = createAsyncThunk(
  'plans/assign',
  async ({ id, data }: { id: number; data: object }) => {
    await plansApi.assign(id, data);
  }
);

export const fetchMemberPlan = createAsyncThunk('plans/fetchMemberPlan', async (memberId: number) => {
  const res = await plansApi.memberPlan(memberId);
  return res.data as MemberPlan | null;
});

export const completeWorkout = createAsyncThunk('plans/complete', async (data: object) => {
  await plansApi.complete(data);
});

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.loading = true; })
      .addCase(fetchPlans.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchPlans.rejected, (state, action) => { state.loading = false; state.error = String(action.error.message); })
      .addCase(createPlan.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      })
      .addCase(fetchMemberPlan.fulfilled, (state, action) => { state.memberPlan = action.payload; })
      .addCase(completeWorkout.fulfilled, (state) => { state.memberPlan = null; });
  },
});

export default plansSlice.reducer;
