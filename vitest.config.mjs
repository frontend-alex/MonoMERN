import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(fileURLToPath(new URL("./app/client/src", import.meta.url))),
      "@server": resolve(
        fileURLToPath(new URL("./app/server/src", import.meta.url)),
      ),
    },
  },
  server: {
    deps: {
      external: ["bcrypt", "mongoose", "express", "passport"],
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", "build"],
    
    deps: {
      interopDefault: true,
      moduleDirectories: [
        "node_modules",
        "app/server/node_modules",
        "packages/shared/node_modules",
      ],
    },
  },
});
