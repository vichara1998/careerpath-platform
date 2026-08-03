import api from "./axios.js";
export const universityApi = {
  getAll: (params) => api.get("/universities/public", { params }),
  getById: (id) => api.get(`/universities/public/${id}`),
  getCourses: (id, p) =>
    api.get(`/universities/public/${id}/courses`, { params: p }),
  create: (data) => api.post("/provider/universities", data),
  verify: (id) => api.patch(`/admin/universities/${id}/verify`),
};
