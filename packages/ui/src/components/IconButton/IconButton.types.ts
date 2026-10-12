import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { iconButtonVariants } from "../Button/Button.variants";

export type IconButtonVariant = NonNullable<VariantProps<typeof iconButtonVariants>["variant"]>;
export type IconButtonSize = NonNullable<VariantProps<typeof iconButtonVariants>["size"]>;

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label" | "aria-labelledby"
> {
  /**
   * Accessible name. **Required**: an icon alone has no text, so without it the control would be
   * announced as just "button". Describe the action ("Close dialog"), not the glyph ("X").
   */
  "aria-label": string;
  /** The icon (decorative SVG). */
  children: ReactNode;
  /** @default "ghost" */
  variant?: IconButtonVariant;
  /** @default "md" */
  size?: IconButtonSize;
  /** Same behaviour as `Button.loading`: busy, not activatable, still focusable, same size. */
  loading?: boolean;
}
