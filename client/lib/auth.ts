// client/lib/auth.ts
export function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("canAccessDetails");
  sessionStorage.clear();
  window.location.href = "/login"; // force full redirect
}