import api from "./axios.js";

export const profileApi = {
  get: () => api.get("/profile"),
  update: (data) => api.put("/profile", data),
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/profile/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  removePicture: () => api.delete("/profile/picture"),
};
