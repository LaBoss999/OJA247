import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Marketer sessions are a distinct account type from the business owner's
// (see backend marketerAuthMiddleware.js) — kept on a separate axios
// instance so the two tokens never collide on the same requests.
const marketerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

marketerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("marketerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default marketerApi;