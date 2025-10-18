// ✅ Detect environment (Render or local)
const isProduction = import.meta.env.PROD;

// ✅ Set API base URL
// - In local dev: /api → handled by Vite proxy (http://localhost:8080)
// - In production: hits backend directly (https://prgi-backend.onrender.com/api)
export const API_BASE = isProduction
  ? "https://prgi-backend.onrender.com/api"
  : "/api";

export const DEMO = false;

export type ApiOptions = RequestInit & { auth?: boolean };

// ✅ Utility: safely join base URL + path
function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ✅ Core fetch helper for API calls
export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}) {
  if (DEMO) throw new Error("Demo mode disabled");

  const url = joinUrl(API_BASE, path);
  const headers = new Headers(opts.headers || {});

  // Set default content-type
  if (!headers.has("Content-Type") && opts.body && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  // Add Authorization header if available
  const useAuth = opts.auth !== false;
  const token = localStorage.getItem("jwtToken");
  if (useAuth && token) headers.set("Authorization", `Bearer ${token}`);

  console.log(`[apiFetch] 🚀 Request to: ${url}`);
  console.log(`[apiFetch] Method: ${opts.method || "GET"}`);
  console.log(`[apiFetch] Auth: ${useAuth}, Token present: ${!!token}`);

  const res = await fetch(url, { ...opts, headers });

  console.log(`[apiFetch] ✅ Response status: ${res.status}`);
  console.log(`[apiFetch] Response ok: ${res.ok}`);

  // Handle unauthorized (401)
  if (res.status === 401) {
    console.warn("[apiFetch] 🔒 Unauthorized - clearing storage and redirecting to login");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // Handle non-OK errors
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    console.error(`[apiFetch] ❌ Error response:`, errorText);
    throw new Error(errorText);
  }

  // Handle no-content (204 or empty body)
  const contentLength = res.headers.get("content-length");
  if (!contentLength || parseInt(contentLength) === 0) {
    throw new Error("Server returned empty response. Please check backend logs.");
  }

  // Parse response
  const ct = res.headers.get("content-type") || "";
  const data = (ct.includes("application/json")
    ? await res.json()
    : await res.text()) as T;

  console.log(`[apiFetch] 📦 Parsed response data:`, data);
  return data;
}