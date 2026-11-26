import { defineConfig } from "vite";

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      include: ["test/error.test-d.ts"],
      tsconfig: "test/tsconfig.error-path.json",
    },
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["html"],
      thresholds: {
        100: true,
      },
    },
  },
});
