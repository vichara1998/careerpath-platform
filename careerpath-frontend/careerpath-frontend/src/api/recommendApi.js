import api from "./axios.js";
export const recommendApi = {
  getRecommendations: (data) => api.post("/recommendations", data),
  chat: (data) => api.post("/recommendations/chat", data),
};
