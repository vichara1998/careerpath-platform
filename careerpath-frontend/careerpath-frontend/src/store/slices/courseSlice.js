import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const fetchCourses = createAsyncThunk(
  "courses/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/courses/public/search", { params });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchFeatured = createAsyncThunk(
  "courses/featured",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/courses/public/featured");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    items: [],
    featured: [],
    total: 0,
    totalPages: 0,
    page: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCourses.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload?.content || [];
        s.total = a.payload?.totalElements || 0;
        s.totalPages = a.payload?.totalPages || 0;
        s.page = a.payload?.number || 0;
      })
      .addCase(fetchCourses.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(fetchFeatured.fulfilled, (s, a) => {
        s.featured = a.payload || [];
      });
  },
});
export default courseSlice.reducer;
