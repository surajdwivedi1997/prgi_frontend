// ✅ Detect if we are in production (Render)
const isProduction = import.meta.env.PROD;

// ✅ Base URL configuration
// - In production → use full backend URL
// - In development → use "/api" (handled by Vite proxy)
export const API_BASE = isProduction
  ? "https://prgi-backend.onrender.com/api"  // ✅ Added /api
  : "/api";

export const DEMO = false;

export type ApiOptions = RequestInit & { auth?: boolean };

// ✅ Utility to safely join URLs
function joinUrl(base: string, path: string) {
  if (!base) return path; // base is empty → handled by proxy
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ✅ Main API wrapper
export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}) {
  if (DEMO) throw new Error("Demo mode disabled");

  // Build URL properly
  const url = joinUrl(API_BASE, path);
  const headers = new Headers(opts.headers || {});

  // Default content type
  if (!headers.has("Content-Type") && opts.body && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  // Attach auth header if token exists
  const useAuth = opts.auth !== false;
  const token = localStorage.getItem("jwtToken");
  if (useAuth && token) headers.set("Authorization", `Bearer ${token}`);

  console.log(`[apiFetch] 🚀 Request to: ${url}`);
  console.log(`[apiFetch] Method: ${opts.method || "GET"}`);
  console.log(`[apiFetch] Auth: ${useAuth}, Token present: ${!!token}`);

  // Perform request
  const res = await fetch(url, { ...opts, headers });

  console.log(`[apiFetch] ✅ Response status: ${res.status}`);
  console.log(`[apiFetch] Response ok: ${res.ok}`);

  // Handle unauthorized case
  if (res.status === 401) {
    console.warn("[apiFetch] 🔒 Unauthorized - redirecting to login");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // Handle other errors
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    console.error(`[apiFetch] ❌ Error response:`, errorText);
    throw new Error(errorText);
  }

  // Parse response safely
  const ct = res.headers.get("content-type") || "";
  console.log(`[apiFetch] Content-Type: ${ct}`);

  const data = (ct.includes("application/json")
    ? await res.json()
    : await res.text()) as T;

  console.log(`[apiFetch] 📦 Parsed response data:`, data);
  console.log(`[apiFetch] Data type:`, typeof data);
  console.log(
    `[apiFetch] Data keys:`,
    data && typeof data === "object" ? Object.keys(data) : "N/A"
  );

  return data;
}