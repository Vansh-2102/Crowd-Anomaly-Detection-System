import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CameraState, Camera, CameraFormData, QueryParams } from '@/types';
import cameraService from '@/services/cameraService';

const initialState: CameraState = {
  cameras: [],
  selectedCamera: null,
  total: 0,
  isLoading: false,
  isAnalyzing: false,
  error: null,
};

export const fetchCameras = createAsyncThunk('cameras/fetchAll', async (params: QueryParams | undefined, { rejectWithValue }) => {
  try {
    return await cameraService.getCameras(params);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cameras');
  }
});

export const createCamera = createAsyncThunk('cameras/create', async (payload: CameraFormData, { rejectWithValue }) => {
  try {
    return await cameraService.createCamera(payload);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to create camera');
  }
});

export const updateCamera = createAsyncThunk(
  'cameras/update',
  async ({ id, data }: { id: number; data: Partial<CameraFormData> }, { rejectWithValue }) => {
    try {
      return await cameraService.updateCamera(id, data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update camera');
    }
  }
);

export const deleteCamera = createAsyncThunk('cameras/delete', async (id: number, { rejectWithValue }) => {
  try {
    await cameraService.deleteCamera(id);
    return id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to delete camera');
  }
});

const cameraSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    setSelectedCamera: (state, action: PayloadAction<Camera | null>) => {
      state.selectedCamera = action.payload;
    },
    updateCameraAnalysis: (state, action: PayloadAction<{ id: number; data: Partial<Camera> }>) => {
      const idx = state.cameras.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.cameras[idx] = { ...state.cameras[idx], ...action.payload.data };
      }
    },
    clearCameraError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchCameras.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(fetchCameras.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cameras = action.payload.content;
      state.total = action.payload.totalElements;
    });
    builder.addCase(fetchCameras.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // CREATE
    builder.addCase(createCamera.fulfilled, (state, action) => {
      state.cameras.unshift(action.payload);
      state.total += 1;
    });

    // UPDATE
    builder.addCase(updateCamera.fulfilled, (state, action) => {
      const idx = state.cameras.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.cameras[idx] = action.payload;
    });

    // DELETE
    builder.addCase(deleteCamera.fulfilled, (state, action) => {
      state.cameras = state.cameras.filter((c) => c.id !== action.payload);
      state.total -= 1;
    });
  },
});

export const { setSelectedCamera, updateCameraAnalysis, clearCameraError } = cameraSlice.actions;
export default cameraSlice.reducer;
