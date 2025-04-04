import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationsState } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read'>>) => {
      const newNotification = {
        ...action.payload,
        id: uuidv4(),
        read: false,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { 
  addNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearNotifications 
} = notificationsSlice.actions;
export default notificationsSlice.reducer; 