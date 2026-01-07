// ============================================
// Auth Slice
// Authentication state management
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthResponse, LoginCredentials, User } from '@/types';
import { config } from '@/config';
import { mockApi } from '@/services/mockApi';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(config.tokenKey),
  refreshToken: localStorage.getItem(config.refreshTokenKey),
  isAuthenticated: !!localStorage.getItem(config.tokenKey),
  isLoading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await mockApi.login(credentials.email, credentials.password);
      // Store tokens
      localStorage.setItem(config.tokenKey, response.token);
      localStorage.setItem(config.refreshTokenKey, response.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logoutAsync = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.refreshTokenKey);
  }
);

export const refreshTokenAsync = createAsyncThunk<AuthResponse, string>(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await mockApi.refreshToken(refreshToken);
      localStorage.setItem(config.tokenKey, response.token);
      localStorage.setItem(config.refreshTokenKey, response.refreshToken);
      return response;
    } catch (error) {
      localStorage.removeItem(config.tokenKey);
      localStorage.removeItem(config.refreshTokenKey);
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(config.tokenKey);
      localStorage.removeItem(config.refreshTokenKey);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, logout, clearError, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;

export default authSlice.reducer;
