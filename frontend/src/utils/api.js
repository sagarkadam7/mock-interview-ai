import axios from "axios";
import { notifySessionExpired } from "./authSession";

// Dev: setupProxy.js forwards /api to the backend (port 5001).
const api = axios.create({ baseURL: "/api", timeout: 120000, withCredentials: true });

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const reqUrl = String(err.config?.url || "");
    const isAuthAttempt = reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register");
    if (status === 401 && !isAuthAttempt) {
      notifySessionExpired();
      const path = window.location?.pathname || "";
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");

// ── Interviews ────────────────────────────────────────────────
export const createInterview = (formData) =>
  api.post("/interview/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getInterview = (id) => api.get(`/interview/${id}`);
export const getAllInterviews = () => api.get("/interview");
export const patchInterviewMeta = (id, data) => api.patch(`/interview/${id}/meta`, data);
export const duplicateInterview = (id) => api.post(`/interview/${id}/duplicate`);
export const submitAnswer = (id, data) => api.post(`/interview/${id}/answer`, data);
export const deleteInterview = (id) => api.delete(`/interview/${id}`);

// ── Billing / Plan ────────────────────────────────────────────
export const getBillingMe = () => api.get("/billing/me");
export const upgradePlan = (plan) => api.post("/billing/upgrade", { plan });

// ── Sharing ───────────────────────────────────────────────────
export const createShareToken = (interviewId) => api.post(`/interview/${interviewId}/share`);
export const getSharedReport = (token) => api.get(`/share/${token}`);

export default api;
