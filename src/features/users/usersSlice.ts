// ============================================
// Users Slice
// Users module state management
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, PaginatedResponse, TableState } from '@/types';
import { mockApi } from '@/services/mockApi';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  tableState: TableState;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  tableState: {
    page: 1,
    pageSize: 25,
    sort: null,
    filters: [],
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk<
  PaginatedResponse<User>,
  { page?: number; pageSize?: number; search?: string }
>('users/fetchUsers', async ({ page = 1, pageSize = 25, search = '' }) => {
  return await mockApi.getUsers(page, pageSize, search);
});

export const fetchUserById = createAsyncThunk<User, string>(
  'users/fetchUserById',
  async (id) => {
    return await mockApi.getUserById(id);
  }
);

export const createUser = createAsyncThunk<User, Partial<User>>(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await mockApi.createUser(userData);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: string; data: Partial<User> }>(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await mockApi.updateUser(id, data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await mockApi.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setTableState: (state, action: PayloadAction<Partial<TableState>>) => {
      state.tableState = { ...state.tableState, ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for user status
    optimisticUpdateUserStatus: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) {
        user.isActive = action.payload.isActive;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Fetch User By Id
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTableState, setSelectedUser, clearError, optimisticUpdateUserStatus } = usersSlice.actions;

// Selectors
export const selectUsers = (state: { users: UsersState }) => state.users.users;
export const selectSelectedUser = (state: { users: UsersState }) => state.users.selectedUser;
export const selectUsersPagination = (state: { users: UsersState }) => state.users.pagination;
export const selectUsersTableState = (state: { users: UsersState }) => state.users.tableState;
export const selectUsersLoading = (state: { users: UsersState }) => state.users.isLoading;
export const selectUsersError = (state: { users: UsersState }) => state.users.error;

export default usersSlice.reducer;
