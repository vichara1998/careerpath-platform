import api from "./axios.js";
export const applicationApi = {
  apply: (data) => api.post("/applications", data),
  getMyApps: (params) => api.get("/applications/my", { params }),
  getById: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`),
  getCourseApps: (cId, params) =>
    api.get(`/provider/applications/course/${cId}`, { params }),
  updateStatus: (id, status) =>
    api.patch(`/provider/applications/${id}/status`, { status }),
};
