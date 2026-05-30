import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exercisesApi } from '../../services/api';

export interface Exercise {
  id: number;
  name: string;
  category: string;
  body_part: string;
  image_url: string | null;
  difficulty: string;
  equipment: string;
  how_to_do: string;
  muscles_targeted: string;
}

interface ExercisesState {
  list: Exercise[];
  bodyParts: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ExercisesState = { list: [], bodyParts: [], loading: false, error: null };

export const fetchExercises = createAsyncThunk(
  'exercises/fetchAll',
  async (params?: object) => {
    const res = await exercisesApi.list(params);
    return res.data as Exercise[];
  }
);

export const fetchBodyParts = createAsyncThunk('exercises/fetchBodyParts', async () => {
  const res = await exercisesApi.bodyParts();
  return res.data as string[];
});

export const createExercise = createAsyncThunk('exercises/create', async (data: object) => {
  const res = await exercisesApi.create(data);
  return res.data as Exercise;
});

export const updateExercise = createAsyncThunk(
  'exercises/update',
  async ({ id, data }: { id: number; data: object }) => {
    const res = await exercisesApi.update(id, data);
    return res.data as Exercise;
  }
);

export const deleteExercise = createAsyncThunk('exercises/delete', async (id: number) => {
  await exercisesApi.delete(id);
  return id;
});

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchExercises.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchExercises.rejected, (state, action) => { state.loading = false; state.error = String(action.error.message); })
      .addCase(fetchBodyParts.fulfilled, (state, action) => { state.bodyParts = action.payload; })
      .addCase(createExercise.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateExercise.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
      });
  },
});

export default exercisesSlice.reducer;
