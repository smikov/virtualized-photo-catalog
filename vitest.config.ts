import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/shared/lib/testSetup.ts',
    env: {
      VITE_PHOTOS_AUTOLOAD: 'on',
      VITE_API_ARTIFICIAL_DELAY_MS: '0',
      VITE_API_PAGE_SIZE: '500',
      VITE_API_MAX_CONCURRENCY: '3',
      VITE_API_URL: 'https://jsonplaceholder.typicode.com/photos',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/shared/lib/testSetup.ts',
        'src/app/index.tsx',
        'src/testing/**',
      ],
      thresholds: {
        lines: 90,
        functions: 85,
        branches: 85,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
