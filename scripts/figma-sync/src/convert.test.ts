import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ConversionError, convert, floatToDimension } from "./convert.ts";
import { flatten } from "./dtcg.ts";
import { alias, figma } from "./helpers.ts";

const flat = (response: ReturnType<typeof figma>, file: string) => {
  const found = convert(response).files.find((f) => f.file === file);
  assert.ok(found, `expected ${file} to be generated`);
  return flatten(found.tree);
};

describe("convert", () => {
  const response = figma({
    collections: [
      { name: "Primitives" },
      { name: "Semantic", modes: ["Light", "Dark"] },
      { name: "Components" },
    ],
    variables: [
      {
        collection: "Primitives",
        name: "color/blue/600",
        values: { Value: { r: 37 / 255, g: 99 / 255, b: 235 / 255 } },
      },
      { collection: "Primitives", name: "color/white", values: { Value: { r: 1, g: 1, b: 1 } } },
      {
        collection: "Primitives",
        name: "color/black-alpha/50",
        values: { Value: { r: 0, g: 0, b: 0, a: 128 / 255 } },
      },
      { collection: "Primitives", name: "spacing/4", type: "FLOAT", values: { Value: 16 } },
      { collection: "Primitives", name: "radius/md", type: "FLOAT", values: { Value: 6 } },
      { collection: "Primitives", name: "radius/full", type: "FLOAT", values: { Value: 9999 } },
      { collection: "Primitives", name: "border-width/1", type: "FLOAT", values: { Value: 1 } },
      {
        collection: "Semantic",
        name: "color/action/primary/DEFAULT",
        description: "Primary action",
        values: { Light: alias("color/blue/600"), Dark: alias("color/white") },
      },
      {
        collection: "Semantic",
        name: "spacing/md",
        type: "FLOAT",
        values: { Light: alias("spacing/4"), Dark: alias("spacing/4") },
      },
      {
        collection: "Components",
        name: "button/background/primary",
        values: { Value: alias("color/action/primary/DEFAULT") },
      },
    ],
  });

  it("converts colours to hex, with alpha only when needed", () => {
    const tokens = flat(response, "primitive/color.json");
    assert.equal(tokens.get("color.blue.600")?.value, "#2563eb");
    assert.equal(tokens.get("color.white")?.value, "#ffffff");
    assert.equal(tokens.get("color.black-alpha.50")?.value, "#00000080");
    assert.equal(tokens.get("color.blue.600")?.type, "color");
  });

  it("converts px floats to rem, keeping px for borders and the pill radius", () => {
    const tokens = flat(response, "primitive/dimension.json");
    assert.equal(tokens.get("spacing.4")?.value, "1rem");
    assert.equal(tokens.get("radius.md")?.value, "0.375rem");
    assert.equal(tokens.get("radius.full")?.value, "9999px");
    assert.equal(tokens.get("border-width.1")?.value, "1px");
    assert.equal(floatToDimension("spacing", 1024), "64rem"); // a large breakpoint is still rem
    assert.equal(floatToDimension("spacing", 0), "0rem");
  });

  it("turns aliases into DTCG references and DEFAULT into $root", () => {
    const light = flat(response, "semantic/color.light.json");
    assert.equal(light.get("color.action.primary.$root")?.value, "{color.blue.600}");
    const component = flat(response, "component/button.json");
    assert.equal(component.get("button.background.primary")?.value, "{color.action.primary.$root}");
  });

  it("emits one file per mode and keeps the description in the default mode only", () => {
    const light = flat(response, "semantic/color.light.json");
    const dark = flat(response, "semantic/color.dark.json");
    assert.equal(dark.get("color.action.primary.$root")?.value, "{color.white}");
    assert.equal(light.get("color.action.primary.$root")?.description, "Primary action");
    assert.equal(dark.get("color.action.primary.$root")?.description, undefined);
  });

  it("routes non-colour semantic variables to shared.json using the default mode", () => {
    assert.equal(flat(response, "semantic/shared.json").get("spacing.md")?.value, "{spacing.4}");
  });

  it("declares which top-level groups each file owns", () => {
    const files = convert(response).files;
    assert.deepEqual(files.find((f) => f.file === "semantic/shared.json")?.ownedRoots, [
      "spacing",
      "radius",
      "size",
      "border-width",
      "breakpoint",
    ]);
    assert.deepEqual(files.find((f) => f.file === "component/button.json")?.ownedRoots, ["button"]);
  });

  it("warns about collections it does not know", () => {
    const withExtra = figma({
      collections: [{ name: "Primitives" }, { name: "Scratchpad" }],
      variables: [],
    });
    assert.match(convert(withExtra).warnings.join("\n"), /Scratchpad/);
  });
});

describe("convert: errors are collected and explain how to fix them", () => {
  const messages = (response: ReturnType<typeof figma>) => {
    try {
      convert(response);
    } catch (e) {
      assert.ok(e instanceof ConversionError);
      return e.issues.join("\n");
    }
    assert.fail("expected a ConversionError");
  };

  it("rejects invalid names", () => {
    const out = messages(
      figma({
        collections: [{ name: "Primitives" }],
        variables: [
          {
            collection: "Primitives",
            name: "Color/Blue 600",
            values: { Value: { r: 0, g: 0, b: 0 } },
          },
        ],
      }),
    );
    assert.match(out, /invalid name segment "Color"/);
  });

  it("rejects aliases to unknown or remote variables", () => {
    const out = messages(
      figma({
        collections: [{ name: "Primitives" }, { name: "Semantic", modes: ["Light", "Dark"] }],
        variables: [
          {
            collection: "Primitives",
            name: "color/ext",
            values: { Value: { r: 0, g: 0, b: 0 } },
            remote: true,
          },
          {
            collection: "Semantic",
            name: "color/a",
            values: { Light: alias("nope"), Dark: alias("color/ext") },
          },
        ],
      }),
    );
    assert.match(out, /color\/a: alias points to an unknown variable/);
    assert.match(out, /alias to remote variable "color\/ext"/);
  });

  it("rejects unsupported types and unmapped groups (typography/effects are code-owned)", () => {
    const out = messages(
      figma({
        collections: [{ name: "Primitives" }],
        variables: [
          {
            collection: "Primitives",
            name: "font/family/sans",
            type: "STRING",
            values: { Value: "Inter" },
          },
          { collection: "Primitives", name: "shadow/sm", type: "FLOAT", values: { Value: 1 } },
        ],
      }),
    );
    assert.match(out, /primitive group "font" is not synced/);
    assert.match(out, /primitive group "shadow" is not synced/);
  });

  it("requires every colour to have a value for every mode", () => {
    const out = messages(
      figma({
        collections: [{ name: "Primitives" }, { name: "Semantic", modes: ["Light", "Dark"] }],
        variables: [
          {
            collection: "Primitives",
            name: "color/white",
            values: { Value: { r: 1, g: 1, b: 1 } },
          },
          {
            collection: "Semantic",
            name: "color/bg/primary",
            values: { Light: alias("color/white") },
          },
        ],
      }),
    );
    assert.match(out, /missing a value for mode "Dark"/);
  });

  it("reports every problem at once, not just the first", () => {
    const out = messages(
      figma({
        collections: [{ name: "Primitives" }],
        variables: [
          { collection: "Primitives", name: "Bad Name", values: { Value: { r: 0, g: 0, b: 0 } } },
          { collection: "Primitives", name: "font/x", type: "STRING", values: { Value: "x" } },
        ],
      }),
    );
    assert.equal(out.split("\n").length, 2);
  });
});
