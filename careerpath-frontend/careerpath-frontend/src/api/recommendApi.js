import api from "./axios.js";
export const recommendApi = {
  getRecommendations: (data, { signal } = {}) => api.post("/recommendations", data, { signal }),
  chat: (data) => api.post("/recommendations/chat", data),
};
