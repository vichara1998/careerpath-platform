import api from "./axios.js";
export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUserStatus: (id, s) =>
    api.patch(`/admin/users/${id}/status`, { status: s }),
  getPendingCourses: (params) => api.get("/admin/courses/pending", { params }),
  approveCourse: (id) => api.patch(`/admin/courses/${id}/approve`),
  rejectCourse: (id) => api.patch(`/admin/courses/${id}/reject`),
  getUniversities: (params) => api.get("/admin/universities", { params }),
  verifyUniversity: (id) => api.patch(`/admin/universities/${id}/verify`),
};
