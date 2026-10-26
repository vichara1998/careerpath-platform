import { createSlice } from "@reduxjs/toolkit";
const savedTheme = localStorage.getItem("theme");
const darkMode = savedTheme === "dark" ||
  (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", darkMode);
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode,
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
