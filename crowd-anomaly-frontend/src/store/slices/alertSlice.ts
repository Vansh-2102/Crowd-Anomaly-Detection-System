import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertState, Alert } from '@/types';

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
  connected: false,
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      state.unreadCount += 1;
      // Keep only the latest 100 alerts
      if (state.alerts.length > 100) {
        state.alerts = state.alerts.slice(0, 100);
      }
    },
    markAllRead: (state) => {
      state.alerts = state.alerts.map((a) => ({ ...a, read: true }));
      state.unreadCount = 0;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert && !alert.read) {
        alert.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.unreadCount = 0;
    },
  },
});

export const { addAlert, markAllRead, markRead, setConnected, clearAlerts } = alertSlice.actions;
export default alertSlice.reducer;
