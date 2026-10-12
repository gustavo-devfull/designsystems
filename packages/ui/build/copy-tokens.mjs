import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Ship the raw tokens and the Tailwind theme next to styles.css:
//   "@sette/ui/tokens.css"   – CSS variables only
//   "@sette/ui/tailwind.css" – @theme mapping so an app's own Tailwind generates the same utilities
for (const file of ["tokens.css", "tailwind.css"]) {
  copyFileSync(
    require.resolve(`@design-system/tokens/${file}`),
    new URL(`../dist/${file}`, import.meta.url),
  );
}
