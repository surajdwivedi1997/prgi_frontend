export const API_BASE = ""; // leave blank so Vite proxy handles /api -> backend
export const DEMO = false;  // disable demo mode

export type ApiOptions = RequestInit & { auth?: boolean };

function joinUrl(base: string, path: string) {
  if (!base) return path; // base is empty → direct /api call → Vite proxy
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}) {
  if (DEMO) throw new Error("Demo mode disabled");

  const url = joinUrl(API_BASE, path);
  const headers = new Headers(opts.headers || {});

  if (!headers.has("Content-Type") && opts.body && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const useAuth = opts.auth !== false; // default true
  const token = localStorage.getItem("jwtToken");
  if (useAuth && token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    // auto logout
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(await res.text().catch(() => res.statusText));
  }

  const ct = res.headers.get("content-type") || "";
  return (ct.includes("application/json")
    ? res.json()
    : (res.text() as any)) as Promise<T>;
}