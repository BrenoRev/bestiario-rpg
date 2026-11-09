import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  test: {
    // Testes unitários ficam em src/. O teste de integração (supabase/tests) roda com `npm run test:rls`.
    include: ["src/**/*.test.ts"],
  },
});
