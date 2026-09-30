import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/content/**/*.test.ts'],
    environment: 'node',
    // Pyodide y PGlite tardan unos segundos en iniciar la primera vez.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
