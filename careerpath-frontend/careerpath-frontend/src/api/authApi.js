import api from "./axios.js";
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, pass) =>
    api.post("/auth/reset-password", { token, newPassword: pass }),
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
};
