import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { BadgeProps } from "./Badge.types";
import { badgeVariants } from "./Badge.variants";

/**
 * Short status label. The text must carry the meaning ("Paid", "Failed"): colour is reinforcement,
 * never the only signal (WCAG 1.4.1).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", size = "md", className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
});
