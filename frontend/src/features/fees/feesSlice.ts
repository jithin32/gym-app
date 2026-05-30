import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsApi } from '../../services/api';

export interface Payment {
  id: number;
  member_id: number;
  member_name: string;
  member_code: string;
  plan_id: number;
  plan_name: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  payment_mode: string;
  status: string;
  notes: string;
}

interface FeesState {
  list: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: FeesState = { list: [], loading: false, error: null };

export const fetchPayments = createAsyncThunk(
  'fees/fetchAll',
  async (params?: object) => {
    const res = await paymentsApi.list(params);
    return res.data as Payment[];
  }
);

export const addPayment = createAsyncThunk('fees/add', async (data: object) => {
  const res = await paymentsApi.add(data);
  return res.data as Payment;
});

export const updatePayment = createAsyncThunk(
  'fees/update',
  async ({ id, data }: { id: number; data: object }) => {
    const res = await paymentsApi.update(id, data);
    return res.data as Payment;
  }
);

const feesSlice = createSlice({
  name: 'fees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => { state.loading = true; })
      .addCase(fetchPayments.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchPayments.rejected, (state, action) => { state.loading = false; state.error = String(action.error.message); })
      .addCase(addPayment.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updatePayment.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default feesSlice.reducer;
