import axios from "axios";
import { getToken, logout } from "./auth";
import { getApiBaseUrl } from "./config";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  // Resolve baseURL at request time (SSR vs browser).
  config.baseURL = getApiBaseUrl();
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
