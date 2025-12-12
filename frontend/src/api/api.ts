export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";
export const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  refresh: "/auth/refresh",
  me: "/auth/me",
};
