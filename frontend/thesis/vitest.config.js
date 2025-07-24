import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Move server config outside of test, or configure it for test UI specifically
  server: {
    host: "127.0.0.1", // Changed from 0.0.0.0 to localhost
    port: 3000,
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setupTests.js"],
    css: true,
    include: ["tests/**/*.{test,spec}.{js,jsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "e2e/",
        "*.config.js",
        "src/main.jsx",
      ],
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    teardownTimeout: 15000,
    deps: {
      optimizer: {
        web: {
          include: ["@testing-library/jest-dom"],
        },
      },
    },
    // Add UI-specific server config for vitest UI
    ui: {
      host: "127.0.0.1",
      port: 51205, // Different port to avoid conflicts
    },
  },
});
