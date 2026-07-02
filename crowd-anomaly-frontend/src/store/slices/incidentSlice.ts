import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IncidentState, Incident, IncidentFilters } from '@/types';
import incidentService from '@/services/incidentService';

const initialState: IncidentState = {
  incidents: [],
  selectedIncident: null,
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchIncidents = createAsyncThunk('incidents/fetchAll', async (params: IncidentFilters | undefined, { rejectWithValue }) => {
  try {
    return await incidentService.getIncidents(params);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch incidents');
  }
});

export const fetchIncidentById = createAsyncThunk('incidents/fetchById', async (id: number, { rejectWithValue }) => {
  try {
    return await incidentService.getIncidentById(id);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch incident');
  }
});

export const deleteIncident = createAsyncThunk('incidents/delete', async (id: number, { rejectWithValue }) => {
  try {
    await incidentService.deleteIncident(id);
    return id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to delete incident');
  }
});

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setSelectedIncident: (state, action: PayloadAction<Incident | null>) => {
      state.selectedIncident = action.payload;
    },
    addIncomingIncident: (state, action: PayloadAction<Incident>) => {
      state.incidents.unshift(action.payload);
      state.total += 1;
    },
    clearIncidentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchIncidents.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(fetchIncidents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.incidents = action.payload.content;
      state.total = action.payload.totalElements;
    });
    builder.addCase(fetchIncidents.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
    builder.addCase(fetchIncidentById.fulfilled, (state, action) => { state.selectedIncident = action.payload; });
    builder.addCase(deleteIncident.fulfilled, (state, action) => {
      state.incidents = state.incidents.filter((i) => i.id !== action.payload);
      state.total -= 1;
    });
  },
});

export const { setSelectedIncident, addIncomingIncident, clearIncidentError } = incidentSlice.actions;
export default incidentSlice.reducer;
