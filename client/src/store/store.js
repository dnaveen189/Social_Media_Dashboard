import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import messageReducer from './slices/messageSlice';
import notificationReducer from './slices/notificationSlice';
import friendReducer from './slices/friendSlice'; // Add this

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    messages: messageReducer,
    notifications: notificationReducer,
    friends: friendReducer // Add this
  }
});