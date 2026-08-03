import api from "./axios.js";
export const recommendApi = {
  getRecommendations: (data) => api.post("/recommendations", data),
  getHistory: () => api.get("/recommendations/history"),
  chat: (data) => api.post("/recommendations/chat", data),
};
