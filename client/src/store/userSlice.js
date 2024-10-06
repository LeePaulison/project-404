import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch user data from API on load
export const fetchUser = createAsyncThunk("user/fetchUser", async (uid) => {
  const response = await axios.get(`/api/users/${uid}`);
  return response.data;
});

// Thunk to update user settings (like temperature)
export const updateUserSettings = createAsyncThunk("user/updateUserSettings", async ({ userId, newSettings }) => {
  const response = await axios.put(`/api/users/${userId}`, newSettings);
  return response.data;
});

const initialState = {
  user: null, // Stores user data object
  status: "idle", // Tracks API request status
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user data on initial load
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Handle settings update
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
