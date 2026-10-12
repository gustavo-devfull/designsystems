import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";

// Ship the raw tokens next to styles.css so apps can import "@sette/ui/tokens.css" on its own.
const source = createRequire(import.meta.url).resolve("@design-system/tokens/tokens.css");
copyFileSync(source, new URL("../dist/tokens.css", import.meta.url));
