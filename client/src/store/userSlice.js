import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch user data from API on load
export const fetchUser = createAsyncThunk("user/fetchUser", async (uid) => {
  const response = await axios.get(`/api/users/${uid}`);
  return response.data;
});

// Thunk to update user settings (like temperature or other preferences)
export const updateUserSettings = createAsyncThunk("user/updateUserSettings", async ({ userId, newSettings }) => {
  const response = await axios.put(`/api/users/${userId}`, newSettings);
  return response.data;
});

// Define the initial state for the user slice
const initialState = {
  user: {
    _id: null,
    archived: false,
    createdAt: null,
    updatedAt: null,
    firebaseUIDs: [],
    googleUID: null,
    email: null,
    displayName: null,
    photoURL: null,
  },
  status: 'idle', // loading status for async actions
  error: null,    // to hold error messages
};

// Create the user slice with synchronous reducers and async thunks
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      // This updates the user object with the payload data
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    clearUser(state) {
      // Resets the user state to initial values
      state.user = initialState.user;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUser thunk
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload; // Set fetched user data
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Handle updateUserSettings thunk
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload }; // Update user settings in state
      });
  },
});

// Export the synchronous action creators
export const { setUser, clearUser } = userSlice.actions;

// Export the reducer to include in the store
export default userSlice.reducer;
