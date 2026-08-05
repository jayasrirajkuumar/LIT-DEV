import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@azure/msal-browser/custom-auth": path.resolve(
        __dirname,
        "node_modules/@azure/msal-browser/dist/custom_auth/index.mjs",
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        timeout: 30_000,
        proxyTimeout: 30_000,
      },
      "/socket.io": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
      "/entra-native": {
        target: "https://luxuryintasteauth.ciamlogin.com",
        changeOrigin: true,
        rewrite: (proxyPath) =>
          proxyPath.replace(/^\/entra-native/, "/luxuryintasteauth.onmicrosoft.com"),
      },
    },
  },
});
