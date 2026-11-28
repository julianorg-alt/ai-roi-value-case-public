import { defineConfig } from 'vitest/config';

// Smoke tests only: they load the real page and app module in a simulated DOM.
// Unit tests of the calculation stay on node:test (`node --test`).
export default defineConfig({
  test: {
    include: ['test/smoke/**/*.test.mjs'],
    environment: 'happy-dom',
  },
});
