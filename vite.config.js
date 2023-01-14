import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Sledger",
        short_name: "Sledger",
        description: "The savings ledger app",
        background_color: "#375a7f",
        theme_color: "#375a7f",
        icons: [
          {
            src: "192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
