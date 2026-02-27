const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  let res: Response;
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    } as Record<string, string>;
    res = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error("[Diagnóstico de Rede] Falha de conexão:", err);
    throw new Error("Aguardando estabilidade de conexão...");
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      const message = formatErrorMessage(data?.detail || data?.message || "Request failed");
      throw new Error(message);
    }
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

function formatErrorMessage(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => (typeof item?.msg === "string" ? item.msg : null))
      .filter(Boolean) as string[];
    return messages.length ? messages.join(" | ") : "Request failed";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "Request failed";
  }
}

export function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getToken() {
  if (typeof window === "undefined") return null;
  // Prioritize session storage, fallback to persistent local storage
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

export function removeToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
}
