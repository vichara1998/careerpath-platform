import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import courseReducer from "./slices/courseSlice.js";
import uiReducer from "./slices/uiSlice.js";
import notificationReducer from "./slices/notificationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
