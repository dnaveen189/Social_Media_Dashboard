import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

// Send friend request
export const sendFriendRequest = createAsyncThunk(
  'friends/sendRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/friend-requests/send/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send request' });
    }
  }
);

// Accept friend request
export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/friend-requests/accept/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to accept request' });
    }
  }
);

// Reject friend request
export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/friend-requests/reject/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reject request' });
    }
  }
);

// Unfriend
export const unfriend = createAsyncThunk(
  'friends/unfriend',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/friend-requests/unfriend/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to unfriend' });
    }
  }
);

// Fetch received requests
export const fetchReceivedRequests = createAsyncThunk(
  'friends/fetchReceived',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/friend-requests/requests/received`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch requests' });
    }
  }
);

// Fetch friends list
export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/friend-requests/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch friends' });
    }
  }
);

const friendSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    receivedRequests: [],
    sentRequests: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addReceivedRequest: (state, action) => {
      // Check if not already in list
      if (!state.receivedRequests.some(r => r._id === action.payload._id)) {
        state.receivedRequests.push(action.payload);
      }
    },
    removeReceivedRequest: (state, action) => {
      state.receivedRequests = state.receivedRequests.filter(
        r => r._id !== action.payload
      );
    },
    addToFriends: (state, action) => {
      if (!state.friends.some(f => f._id === action.payload._id)) {
        state.friends.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch received requests
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = action.payload;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      // Accept request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.receivedRequests = state.receivedRequests.filter(
          r => r._id !== action.payload.userId
        );
      })
      // Reject request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.receivedRequests = state.receivedRequests.filter(
          r => r._id !== action.payload.userId
        );
      })
      // Unfriend
      .addCase(unfriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(
          f => f._id !== action.payload.userId
        );
      });
  }
});

export const { clearError, addReceivedRequest, removeReceivedRequest, addToFriends } = friendSlice.actions;
export default friendSlice.reducer;