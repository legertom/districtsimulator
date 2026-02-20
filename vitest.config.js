import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./test/setup.js"],
        globals: true,
        include: ["src/__tests__/**/*.test.{js,jsx}"],
        exclude: ["tests/e2e/**"],
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
