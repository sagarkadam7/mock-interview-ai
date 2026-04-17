import axios from "axios";

// Dev: setupProxy.js forwards /api to the backend (port 5001).
const api = axios.create({ baseURL: "/api" });

// Attach token automatically on every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

// ── Interviews ────────────────────────────────────────────────
export const createInterview = (formData) =>
  api.post("/interview/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getInterview = (id) => api.get(`/interview/${id}`);
export const getAllInterviews = () => api.get("/interview");
export const submitAnswer = (id, data) => api.post(`/interview/${id}/answer`, data);
export const deleteInterview = (id) => api.delete(`/interview/${id}`);

export default api;
