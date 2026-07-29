import axios from "axios";
import { getToken, logout } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Augmenté à 30 secondes
});

api.interceptors.request.use((config) => {
  const token = getToken();
  config.headers = config.headers ?? {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (process.env.NODE_ENV !== "production") {
    console.debug("API request", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      token: token ? "present" : "missing",
    });
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      logout();
      window.location.href = "/connexion";
    }
    return Promise.reject(error);
  }
);

export default api;
