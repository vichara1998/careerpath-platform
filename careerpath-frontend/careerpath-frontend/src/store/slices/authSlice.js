import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

const stored = localStorage.getItem("cp_user");
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: localStorage.getItem("cp_token") || null,
    loading: false,
    error: null,
    registered: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("cp_user");
      localStorage.removeItem("cp_token");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistered: (state) => {
      state.registered = false;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        s.token = a.payload.accessToken;
        localStorage.setItem("cp_user", JSON.stringify(a.payload));
        localStorage.setItem("cp_token", a.payload.accessToken);
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s) => {
        s.loading = false;
        s.registered = true;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});
export const { logout, clearError, clearRegistered, setCredentials } =
  authSlice.actions;
export default authSlice.reducer;
