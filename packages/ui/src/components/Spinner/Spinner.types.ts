import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { spinnerVariants } from "./Spinner.variants";

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>["size"]>;

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** @default "md" */
  size?: SpinnerSize;
  /**
   * Accessible name announced to screen readers (`role="status"`).
   * Omit when the spinner is decorative, e.g. inside a button that already exposes `aria-busy`.
   */
  label?: string;
}
