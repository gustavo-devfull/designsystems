import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";
import { mergeConfig } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const packages = path.resolve(here, "../../../packages");

const config: StorybookConfig = {
  // Component stories live next to their component; docs pages live in this app.
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
    "../../../packages/*/src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    {
      name: "@storybook/addon-docs",
      // GFM: tables and task lists in MDX docs.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  typescript: {
    // Resolves prop types to their literal unions (react-docgen shows `NonNullable<…>`).
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      // Hide the ~250 inherited DOM attributes; document our own API.
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: {
        // Develop against package sources (HMR) instead of requiring a build of each package.
        // Exact-match regexes keep "@sette/ui/styles.css" style subpaths untouched.
        alias: [
          { find: /^@sette\/ui$/, replacement: path.join(packages, "ui/src/index.ts") },
          {
            find: /^@design-system\/icons$/,
            replacement: path.join(packages, "icons/src/index.ts"),
          },
        ],
      },
    }),
};

export default config;
