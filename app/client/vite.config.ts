import path from "path";
import fs from "fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteImagemin from "vite-plugin-imagemin";
import viteCompression from "vite-plugin-compression";

import { defineConfig, type Plugin } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

// Plugin to restart Vite dev server when .env files change
function envReloadPlugin(): Plugin {
  return {
    name: "env-reload",
    configureServer(server) {
      const envFiles = [
        ".env",
        ".env.local",
        ".env.development",
        ".env.development.local",
      ];

      envFiles.forEach((file) => {
        const envPath = path.resolve(__dirname, file);
        if (fs.existsSync(envPath)) {
          fs.watch(envPath, () => {
            console.log(
              `\n[env-reload] ${file} changed, restarting server...\n`,
            );
            server.restart();
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    envReloadPlugin(),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
    }),
    visualizer({ open: true }),
    viteImagemin({
      webp: {
        quality: 80,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "react-hook-form",
      "zod",
    ],
  },
});
