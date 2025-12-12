import { apiFetch } from "./http";

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

function saveAuth(res: AuthResponse) {
  localStorage.setItem("accessToken", res.accessToken);
  localStorage.setItem("refreshToken", res.refreshToken);
  localStorage.setItem("user", JSON.stringify(res.user));
}

export async function login(data: { email: string; password: string }) {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }, false);

  saveAuth(res);
  return res;
}

export async function register(data: { username: string; email: string; password: string }) {
  const res = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }, false);

  saveAuth(res);
  return res;
}

// если очень захочешь — можно будет вызвать вручную
export async function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}