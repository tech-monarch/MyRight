import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

  VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["pwa-192x192.png", "pwa-512x512.png"]
  })
  ],
});