import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Design-token scale names that tailwind-merge cannot infer (our Tailwind theme replaces the
 * defaults). Kept in sync with @design-system/tokens by `cn.test.ts`.
 */
export const tokenScales = {
  text: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
  spacing: ["xs", "sm", "md", "lg", "xl", "2xl", "control-sm", "control-md", "control-lg"],
  radius: ["control", "surface", "pill"],
  shadow: ["low", "mid", "high"],
  fontWeight: ["regular", "medium", "semibold", "bold"],
} as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...tokenScales.text],
      spacing: [...tokenScales.spacing],
      radius: [...tokenScales.radius],
      shadow: [...tokenScales.shadow],
      "font-weight": [...tokenScales.fontWeight],
    },
  },
});

/** Joins class names and resolves Tailwind conflicts (last one wins): `cn("px-md", "px-lg")`. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
