import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { membersApi } from '../../services/api';

export interface Member {
  id: number;
  member_id: string;
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  join_date: string;
  plan_id: number;
  plan_name: string;
  plan_price: number;
  start_date: string;
  end_date: string;
  coach_id: number | null;
  coach_name: string | null;
  goal: string;
  injuries: string;
  experience: string;
  emergency_contact: string;
  status: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  duration_days: number;
  price: number;
}

interface MembersState {
  list: Member[];
  plans: MembershipPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: MembersState = { list: [], plans: [], loading: false, error: null };

export const fetchMembers = createAsyncThunk(
  'members/fetchAll',
  async (params?: object) => {
    const res = await membersApi.list(params);
    return res.data as Member[];
  }
);

export const fetchPlans = createAsyncThunk('members/fetchPlans', async () => {
  const res = await membersApi.plans();
  return res.data as MembershipPlan[];
});

export const createMember = createAsyncThunk(
  'members/create',
  async (data: object, { rejectWithValue }) => {
    try {
      const res = await membersApi.create(data);
      return res.data as Member;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Create failed');
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/update',
  async ({ id, data }: { id: number; data: object }, { rejectWithValue }) => {
    try {
      const res = await membersApi.update(id, data);
      return res.data as Member;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'Update failed');
    }
  }
);

export const deleteMember = createAsyncThunk('members/delete', async (id: number) => {
  await membersApi.delete(id);
  return id;
});

export const freezeMember = createAsyncThunk('members/freeze', async (id: number) => {
  const res = await membersApi.freeze(id);
  return res.data as Member;
});

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMembers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchMembers.rejected, (state, action) => { state.loading = false; state.error = String(action.error.message); })
      .addCase(fetchPlans.fulfilled, (state, action) => { state.plans = action.payload; })
      .addCase(createMember.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateMember.fulfilled, (state, action) => {
        const idx = state.list.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m.id !== action.payload);
      })
      .addCase(freezeMember.fulfilled, (state, action) => {
        const idx = state.list.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], status: action.payload.status };
      });
  },
});

export default membersSlice.reducer;
