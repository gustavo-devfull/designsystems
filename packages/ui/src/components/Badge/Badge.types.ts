import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { badgeVariants } from "./Badge.variants";

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic meaning, not just colour. Figma: `Variant`. @default "neutral" */
  variant?: BadgeVariant;
  /** @default "md" */
  size?: BadgeSize;
}
