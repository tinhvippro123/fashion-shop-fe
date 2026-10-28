export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; message?: string }> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || (payload && payload.success === false)) {
    const errorMsg =
      payload?.message || `Yêu cầu thất bại (HTTP ${res.status})`;
    throw new Error(errorMsg);
  }

  return {
    data: (payload ? payload.data : (null as unknown as T)),
    message: payload?.message,
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const result = await apiRequestWithMeta<T>(path, options);
  return result.data;
}

