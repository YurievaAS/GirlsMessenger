import { API_BASE_URL } from "./api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any, message?: string) {
    super(message || data?.message || "Ошибка запроса");
    this.status = status;
    this.data = data;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      return null;
    }

    if (!res.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return null;
    }

    const data = await res.json();
    const newAccess = data.accessToken ?? null;
    const newRefresh = data.refreshToken ?? refreshToken;

    if (newAccess) localStorage.setItem("accessToken", newAccess);
    if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

    return newAccess;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function makeRequest<T>(
  path: string,
  options: RequestInit = {},
  withAuth: boolean
): Promise<T> {
  const url = API_BASE_URL + path;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (withAuth) {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error("Не удалось подключиться к серверу");
  }

  if (!withAuth || res.status !== 401) {
    let data = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) throw new ApiError(res.status, data);
    return data as T;
  }

  const newToken = await refreshAccessToken();

  if (!newToken) {
    let data = null;
    try {
      data = await res.json();
    } catch {}
    throw new ApiError(401, data, "Требуется повторный вход");
  }

  const retryHeaders: Record<string, string> = {
    ...headers,
    Authorization: `Bearer ${newToken}`,
  };

  res = await fetch(url, {
    ...options,
    headers: retryHeaders,
    credentials: "include",
  });

  let retryData = null;
  try {
    retryData = await res.json();
  } catch {}

  if (!res.ok) throw new ApiError(res.status, retryData);
  return retryData as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  withAuth: boolean = true
): Promise<T> {
  return makeRequest<T>(path, options, withAuth);
}
