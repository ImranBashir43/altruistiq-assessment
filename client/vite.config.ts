import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config'; // Imports `defineConfig` from Vitest

export default defineConfig({
  plugins: [vue()], // Enables Vue support

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // ✅ Allows `@` to map to `src/`
    },
  },

  test: {
    environment: 'jsdom', // Required for Vue component testing
    globals: true, // Allows using `describe`, `it`, `expect` globally without imports
  },
});
