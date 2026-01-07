// ============================================
// UI Slice
// Global UI state management
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification, UIState } from '@/types';

const initialState: UIState = {
  sidebarCollapsed: false,
  activeModal: null,
  isOnline: navigator.onLine,
  notifications: [],
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setOnlineStatus,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setTheme,
} = uiSlice.actions;

// Selectors
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectActiveModal = (state: { ui: UIState }) => state.ui.activeModal;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectUnreadNotificationsCount = (state: { ui: UIState }) =>
  state.ui.notifications.filter((n) => !n.read).length;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;

export default uiSlice.reducer;
