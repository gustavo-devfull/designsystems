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
        /^@radix-ui\//,
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
        // React Server Components: modules that use hooks/state/effects must be client modules.
        // Only .tsx modules get the directive: `cn` and the *.variants helpers stay callable from
        // server components.
        banner: (chunk) => (chunk.facadeModuleId?.endsWith(".tsx") ? '"use client";' : ""),
      },
    },
  },
});
