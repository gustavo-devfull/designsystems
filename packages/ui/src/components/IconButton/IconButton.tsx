import { forwardRef, type MouseEvent } from "react";
import { cn } from "../../lib/cn";
import { iconButtonVariants } from "../Button/Button.variants";
import { Spinner } from "../Spinner";
import type { IconButtonProps } from "./IconButton.types";

/** Icon-only button. Square, with a mandatory accessible name. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = "ghost",
    size = "md",
    loading = false,
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
      event.preventDefault();
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
      className={cn(iconButtonVariants({ variant, size }), className)}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      ) : null}
      <span aria-hidden="true" className={cn("inline-flex [&>svg]:size-5", loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
});
