import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { SpinnerProps } from "./Spinner.types";
import { spinnerVariants } from "./Spinner.variants";

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size, label, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className="inline-flex"
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={cn(spinnerVariants({ size }), className)}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
});
