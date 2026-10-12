import { tokenValues } from "@design-system/tokens";
import { cn, tokenScales } from "./cn";

describe("cn", () => {
  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("lets the last conflicting utility win", () => {
    expect(cn("px-md", "px-lg")).toBe("px-lg");
    expect(cn("rounded-control", "rounded-pill")).toBe("rounded-pill");
    expect(cn("shadow-low", "shadow-high")).toBe("shadow-high");
  });

  it("tells font-size apart from colour for token names", () => {
    expect(cn("text-md text-text-primary")).toBe("text-md text-text-primary");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("text-text-primary", "text-text-secondary")).toBe("text-text-secondary");
  });

  it("stays in sync with the token scales", () => {
    const names = Object.keys(tokenValues.light);
    const suffixes = (prefix: string) =>
      names.filter((n) => n.startsWith(prefix)).map((n) => n.slice(prefix.length));
    const same = (actual: readonly string[], expected: string[]) =>
      expect([...actual].sort()).toEqual([...expected].sort());

    same(tokenScales.text, suffixes("font.size."));
    same(tokenScales.fontWeight, suffixes("font.weight."));
    same(tokenScales.shadow, suffixes("elevation."));
    same(
      tokenScales.radius,
      suffixes("radius.").filter((n) => ["control", "surface", "pill"].includes(n)),
    );
    same(tokenScales.spacing, [
      ...suffixes("spacing.").filter((n) => ["xs", "sm", "md", "lg", "xl", "2xl"].includes(n)),
      ...suffixes("size.control.").map((n) => `control-${n}`),
    ]);
  });
});
