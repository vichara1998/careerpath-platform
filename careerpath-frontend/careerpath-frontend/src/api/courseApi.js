import api from "./axios.js";
export const courseApi = {
  search: (params) =>
    api.get("/courses/public/search", {
      params: Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== "" && value != null,
        ),
      ),
    }),
  getFeatured: () => api.get("/courses/public/featured"),
  getById: (id) => api.get(`/courses/public/${id}`),
  create: (data) => api.post("/provider/courses", data),
  approve: (id) => api.patch(`/admin/courses/${id}/approve`),
};
