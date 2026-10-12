import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { compile } from "tailwindcss";
import { buttonVariants } from "../components/Button/Button.variants";
import { spinnerVariants } from "../components/Spinner/Spinner.variants";

const require = createRequire(import.meta.url);
const stylesEntry = path.resolve(__dirname, "../styles.css");

const escapeSelector = (candidate: string) => candidate.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);

/** Every class name a variants function can emit, across all variant combinations. */
function allClasses(): string[] {
  const out = new Set<string>();
  const add = (s: string) =>
    s
      .split(/\s+/)
      .filter(Boolean)
      .forEach((c) => out.add(c));
  for (const variant of ["primary", "secondary", "outline", "ghost", "danger"] as const) {
    for (const size of ["sm", "md", "lg"] as const) {
      for (const fullWidth of [true, false]) add(buttonVariants({ variant, size, fullWidth }));
    }
  }
  for (const size of ["sm", "md", "lg"] as const) add(spinnerVariants({ size }));
  return [...out];
}

describe("CSS contract (Tailwind × design tokens)", () => {
  it("every utility used by a component resolves to a design-token rule", async () => {
    const compiler = await compile(readFileSync(stylesEntry, "utf8"), {
      base: path.dirname(stylesEntry),
      loadStylesheet: (id, base) => {
        const file = id.startsWith(".") ? path.resolve(base, id) : require.resolve(id);
        return Promise.resolve({
          path: file,
          base: path.dirname(file),
          content: readFileSync(file, "utf8"),
        });
      },
    });
    const classes = allClasses();
    const css = compiler.build(classes);

    const unresolved = classes.filter((c) => !css.includes(`.${escapeSelector(c)}`));
    expect(
      unresolved,
      "classes that generate no CSS (typo, or token not exposed to Tailwind)",
    ).toEqual([]);
    expect(css).toMatch(/@keyframes spin/);
  });
});
