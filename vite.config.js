import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import Sitemap from 'vite-plugin-sitemap';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    Sitemap({
      hostname: 'https://tourmada.mg',
      dynamicRoutes: ['/tours', '/login', '/register'],
      outDir: 'dist'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@src": path.resolve(__dirname, "./src"),
    },
  },
});
