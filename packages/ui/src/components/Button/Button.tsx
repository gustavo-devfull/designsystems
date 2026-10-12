import { forwardRef, type MouseEvent } from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "../Spinner";
import type { ButtonProps } from "./Button.types";
import { buttonVariants } from "./Button.variants";

/**
 * Reference component of the design system.
 *
 * `type` defaults to `"button"` so a Button inside a `<form>` never submits by accident.
 * While `loading`, the label stays in the DOM (hidden with opacity) so the width does not change
 * and the accessible name is preserved; the spinner is overlaid.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    type = "button",
    disabled,
    className,
    children,
    onClick,
    ...props
  },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault(); // also blocks implicit form submission
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading && !disabled ? true : undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === "lg" ? "md" : "sm"} />
        </span>
      ) : null}
      <span className={cn("inline-flex items-center gap-sm", loading && "opacity-0")}>
        {leftIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {rightIcon}
          </span>
        ) : null}
      </span>
    </button>
  );
});
