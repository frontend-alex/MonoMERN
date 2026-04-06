import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Client aliases (for client tests)
      '@': resolve(fileURLToPath(new URL('./app/client/src', import.meta.url))),
      // Server aliases (for server tests) - using @server prefix
      '@server': resolve(fileURLToPath(new URL('./app/server/src', import.meta.url))),
      // Shared aliases
      '@shared': resolve(fileURLToPath(new URL('./packages/shared/src', import.meta.url))),
    },
  },
  // Allow vitest to resolve node_modules from server package
  server: {
    deps: {
      external: ['bcrypt', 'mongoose', 'express', 'passport'],
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    // Allow importing from server's node_modules
    deps: {
      interopDefault: true,
      moduleDirectories: [
        'node_modules',
        'app/server/node_modules',
        'packages/shared/node_modules',
      ],
    },
  },
})
