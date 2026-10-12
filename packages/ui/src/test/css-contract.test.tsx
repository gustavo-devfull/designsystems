import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { compile } from "tailwindcss";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Input } from "../components/Input";
import { Radio, RadioGroup } from "../components/Radio";
import { Select } from "../components/Select";
import { Spinner } from "../components/Spinner";
import { Switch } from "../components/Switch";
import { Textarea } from "../components/Textarea";

const require = createRequire(import.meta.url);
const stylesEntry = path.resolve(__dirname, "../styles.css");

const escapeSelector = (candidate: string) => candidate.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);

/** Marker classes that intentionally produce no rule of their own. */
const MARKERS = new Set(["peer", "group"]);

/** Renders every component in every visual state, so inline (non-cva) classes are covered too. */
function renderGallery(): string[] {
  const { container } = render(
    <>
      {(["primary", "secondary", "outline", "ghost", "danger"] as const).flatMap((variant) =>
        (["sm", "md", "lg"] as const).map((size) => (
          <Button
            key={`${variant}${size}`}
            variant={variant}
            size={size}
            fullWidth
            leftIcon={<i />}
            rightIcon={<i />}
          >
            x
          </Button>
        )),
      )}
      <Button loading>x</Button>
      <Button disabled>x</Button>
      <Spinner label="x" size="sm" />
      <Spinner size="lg" />
      {(["sm", "md", "lg"] as const).map((size) => (
        <Input key={size} label="x" size={size} helperText="h" required />
      ))}
      <Input label="x" error="e" disabled hideLabel />
      <Textarea label="x" helperText="h" />
      <Textarea label="x" error="e" required />
      <Select label="x" placeholder="p" helperText="h">
        <option>a</option>
      </Select>
      <Select label="x" error="e" disabled>
        <option>a</option>
      </Select>
      <Checkbox label="x" helperText="h" />
      <Checkbox label="x" indeterminate error="e" required />
      <Checkbox label="x" disabled hideLabel />
      <Switch label="x" helperText="h" />
      <Switch label="x" error="e" disabled />
      <RadioGroup legend="x" required error="e" helperText="h" orientation="horizontal">
        <Radio value="a" label="a" helperText="h" />
        <Radio value="b" label="b" disabled />
      </RadioGroup>
      <RadioGroup legend="x" hideLegend disabled>
        <Radio value="a" label="a" />
      </RadioGroup>
    </>,
  );
  const classes = new Set<string>();
  for (const el of container.querySelectorAll("[class]")) {
    // SVG elements expose className as an object; read the attribute instead.
    for (const c of (el.getAttribute("class") ?? "").split(/\s+/)) if (c) classes.add(c);
  }
  return [...classes].filter((c) => !MARKERS.has(c));
}

describe("CSS contract (Tailwind × design tokens)", () => {
  it("every class a rendered component uses resolves to a design-token rule", async () => {
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
    const classes = renderGallery();
    expect(classes.length).toBeGreaterThan(100);
    const css = compiler.build(classes);

    const unresolved = classes.filter((c) => !css.includes(`.${escapeSelector(c)}`));
    expect(
      unresolved,
      "classes that generate no CSS (typo, or token not exposed to Tailwind)",
    ).toEqual([]);
    expect(css).toMatch(/@keyframes spin/);
  });
});
