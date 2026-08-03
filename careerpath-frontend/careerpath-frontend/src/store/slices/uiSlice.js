import { createSlice } from "@reduxjs/toolkit";
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode: document.documentElement.classList.contains("dark"),
    sidebarOpen: true,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      document.documentElement.classList.toggle("dark", state.darkMode);
      localStorage.setItem("theme", state.darkMode ? "dark" : "light");
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});
export const { toggleDarkMode, setSidebarOpen, toggleSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
