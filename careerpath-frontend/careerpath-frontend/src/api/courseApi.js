import api from "./axios.js";
export const courseApi = {
  search: (params) => api.get("/courses/public/search", { params }),
  getFeatured: () => api.get("/courses/public/featured"),
  getById: (id) => api.get(`/courses/public/${id}`),
  create: (data) => api.post("/provider/courses", data),
  update: (id, data) => api.put(`/provider/courses/${id}`, data),
  delete: (id) => api.delete(`/provider/courses/${id}`),
  approve: (id) => api.patch(`/admin/courses/${id}/approve`),
  saveCourse: (id) => api.post(`/courses/${id}/save`),
  unsaveCourse: (id) => api.delete(`/courses/${id}/save`),
  getSaved: () => api.get("/courses/saved"),
  getReviews: (id) => api.get(`/courses/${id}/reviews`),
  addReview: (id, data) => api.post(`/courses/${id}/reviews`, data),
  getDistricts: () => api.get("/courses/public/districts"),
};
