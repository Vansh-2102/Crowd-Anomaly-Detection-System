import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserState, User, QueryParams } from '@/types';
import userService, { CreateUserPayload, UpdateUserPayload } from '@/services/userService';

const initialState: UserState = {
  users: [],
  selectedUser: null,
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchAll', async (params: QueryParams | undefined, { rejectWithValue }) => {
  try {
    return await userService.getUsers(params);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

export const createUser = createAsyncThunk('users/create', async (payload: CreateUserPayload, { rejectWithValue }) => {
  try {
    return await userService.createUser(payload);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: number; data: UpdateUserPayload }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk('users/delete', async (id: number, { rejectWithValue }) => {
  try {
    await userService.deleteUser(id);
    return id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload.content;
      state.total = action.payload.totalElements;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
    builder.addCase(createUser.fulfilled, (state, action) => { state.users.unshift(action.payload); state.total += 1; });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      const idx = state.users.findIndex((u) => u.id === action.payload.id);
      if (idx !== -1) state.users[idx] = action.payload;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.total -= 1;
    });
  },
});

export const { setSelectedUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
