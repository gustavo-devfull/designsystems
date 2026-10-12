import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// No aliases to package sources: the app consumes the *built* @sette/ui (dist), exactly as a
// real consumer would. `pnpm build` at the repo root builds packages first.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
