/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Evita rodar os testes de worktrees isoladas de outras sessões (ex.: Claude Code)
    exclude: ['**/node_modules/**', '**/.claude/worktrees/**'],
  },
  server: {
    port: 5173,
    host: true,
  },
});
