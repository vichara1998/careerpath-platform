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
  updateMine: (id, data) => api.put(`/provider/courses/${id}`, data),
  getMine: (params) => api.get("/provider/courses", { params }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/provider/courses/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  approve: (id) => api.patch(`/admin/courses/${id}/approve`),
};
