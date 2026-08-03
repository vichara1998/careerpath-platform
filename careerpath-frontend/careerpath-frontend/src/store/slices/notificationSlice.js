import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/notifications");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount--;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (s, a) => {
      s.items = a.payload?.content || [];
      s.unreadCount = (a.payload?.content || []).filter((n) => !n.read).length;
    });
  },
});
export const { decrementUnread, clearUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
