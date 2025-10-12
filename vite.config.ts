import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Helper: dynamically allow ngrok domains
function getAllowedHosts() {
  const envHost = process.env.NGROK_DOMAIN;
  if (envHost) {
    console.log(`✅ Allowing NGROK domain: ${envHost}`);
    return [envHost];
  }
  // Fallback: allow any *.ngrok-free.dev domain
  return [".ngrok-free.dev"];
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    host: true,        // ✅ allow LAN + ngrok
    port: 5173,
    open: true,        // auto-open in browser
    allowedHosts: getAllowedHosts(), // ✅ ngrok domain allowed dynamically
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Spring Boot backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },

  
});