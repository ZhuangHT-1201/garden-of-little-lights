import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "桂庭拾光",
        short_name: "桂庭拾光",
        description: "把庭院里的小光，一件件收好。",
        theme_color: "#e9c2c0",
        background_color: "#f6ead8",
        display: "standalone",
        orientation: "portrait",
        start_url: "./",
        scope: "./",
        lang: "zh-CN",
        categories: ["games", "entertainment"],
        id: "./",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        screenshots: [
          {
            src: "screenshots/cover.png",
            sizes: "1170x2532",
            type: "image/png",
            form_factor: "narrow",
            label: "桂庭拾光 · 小院封面"
          },
          {
            src: "screenshots/game.png",
            sizes: "1170x2532",
            type: "image/png",
            form_factor: "narrow",
            label: "桂庭拾光 · 立体棋盘"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        globIgnores: ["screenshots/**"],
        navigateFallback: "index.html"
      }
    })
  ],
  server: {
    host: true,
    port: 4173
  }
});
