import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { DividerProps } from "./Divider.types";

/**
 * Horizontal dividers are real `<hr>` elements (implicit `separator` role). Vertical ones are a
 * `div[role=separator][aria-orientation=vertical]`, as `<hr>` cannot be vertical.
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation = "horizontal", decorative = false, className, ...props },
  ref,
) {
  if (orientation === "vertical") {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : "vertical"}
        className={cn("w-px shrink-0 self-stretch bg-border-default", className)}
        {...props}
      />
    );
  }
  return (
    <hr
      ref={ref as React.Ref<HTMLHRElement>}
      role={decorative ? "none" : undefined}
      className={cn("m-0 h-px w-full shrink-0 border-0 bg-border-default", className)}
      {...props}
    />
  );
});
