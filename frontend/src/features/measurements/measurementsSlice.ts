import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { measurementsApi } from '../../services/api';

export interface Measurement {
  id: number;
  member_id: number;
  recorded_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  bicep_left_cm: number | null;
  bicep_right_cm: number | null;
  body_fat_pct: number | null;
  notes: string | null;
  recorded_by_name: string | null;
}

interface MeasurementsState {
  records: Measurement[];
  loading: boolean;
  error: string | null;
}

const initialState: MeasurementsState = { records: [], loading: false, error: null };

export const fetchMeasurements = createAsyncThunk(
  'measurements/fetch',
  async (memberId: number) => {
    const res = await measurementsApi.forMember(memberId);
    return res.data as Measurement[];
  }
);

export const addMeasurement = createAsyncThunk(
  'measurements/add',
  async (data: object) => {
    const res = await measurementsApi.add(data);
    return res.data as Measurement;
  }
);

export const deleteMeasurement = createAsyncThunk(
  'measurements/delete',
  async (id: number) => {
    await measurementsApi.delete(id);
    return id;
  }
);

const measurementsSlice = createSlice({
  name: 'measurements',
  initialState,
  reducers: {
    clearMeasurements(state) { state.records = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeasurements.pending, (state) => { state.loading = true; })
      .addCase(fetchMeasurements.fulfilled, (state, action) => { state.loading = false; state.records = action.payload; })
      .addCase(fetchMeasurements.rejected, (state, action) => { state.loading = false; state.error = String(action.error.message); })
      .addCase(addMeasurement.fulfilled, (state, action) => { state.records.unshift(action.payload); })
      .addCase(deleteMeasurement.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r.id !== action.payload);
      });
  },
});

export const { clearMeasurements } = measurementsSlice.actions;
export default measurementsSlice.reducer;
