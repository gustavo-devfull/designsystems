import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { buttonVariants } from "./Button.variants";

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. Figma: `Variant`. @default "primary" */
  variant?: ButtonVariant;
  /** Control height scale. Figma: `Size`. @default "md" */
  size?: ButtonSize;
  /**
   * Shows a spinner and blocks interaction while keeping the button focusable and the same size.
   * Exposed as `aria-busy` + `aria-disabled`; `onClick` and form submission are suppressed.
   */
  loading?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Decorative icon before the label. Pass an `aria-hidden` SVG. */
  leftIcon?: ReactNode;
  /** Decorative icon after the label. */
  rightIcon?: ReactNode;
}
