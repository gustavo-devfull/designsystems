import { defineConfig } from "vite";

/**
 * Library build. Modules are preserved (one file per source module) so bundlers can tree-shake
 * at module granularity; React and runtime deps stay external — no second copy of React.
 */
export default defineConfig({
  build: {
    lib: { entry: { index: "src/index.ts" }, formats: ["es"] },
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
