import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  esbuild: { jsx: "automatic" },
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    maxWorkers: 2,
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
  },
});
