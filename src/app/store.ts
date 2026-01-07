// ============================================
// Redux Store Configuration
// Centralized state management with RTK
// ============================================

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '@/services/api';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import usersReducer from '@/features/users/usersSlice';
import productsReducer from '@/features/products/productsSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  users: usersReducer,
  products: productsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Configure store with middleware
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

// Setup listeners for RTK Query refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
