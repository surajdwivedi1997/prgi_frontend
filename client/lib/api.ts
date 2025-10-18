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

  console.log(`[apiFetch] 🚀 Request to: ${url}`);
  console.log(`[apiFetch] Method: ${opts.method || 'GET'}`);
  console.log(`[apiFetch] Auth: ${useAuth}, Token present: ${!!token}`);

  const res = await fetch(url, { ...opts, headers });

  console.log(`[apiFetch] ✅ Response status: ${res.status}`);
  console.log(`[apiFetch] Response ok: ${res.ok}`);

  if (res.status === 401) {
    // auto logout
    console.log("[apiFetch] 🔒 Unauthorized - clearing storage and redirecting to login");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    console.error(`[apiFetch] ❌ Error response:`, errorText);
    throw new Error(errorText);
  }

  const ct = res.headers.get("content-type") || "";
  console.log(`[apiFetch] Content-Type: ${ct}`);
  
  const data = (ct.includes("application/json")
    ? await res.json()
    : await res.text()) as T;
  
  console.log(`[apiFetch] 📦 Parsed response data:`, data);
  console.log(`[apiFetch] Data type:`, typeof data);
  console.log(`[apiFetch] Data keys:`, data && typeof data === 'object' ? Object.keys(data) : 'N/A');
  
  return data;
}