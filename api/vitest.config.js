import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: { reporter: ['text', 'html'], exclude: ['node_modules/', 'server.js'] },
  },
});