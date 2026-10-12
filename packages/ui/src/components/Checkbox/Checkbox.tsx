import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/cn";
import { FieldLabel, FieldMessage, describedBy, useFieldIds } from "../Field";
import type { CheckboxProps } from "./Checkbox.types";

/**
 * Native `<input type="checkbox">` drawn with design tokens. The input stays the real, focusable,
 * clickable element; the check/dash icons are siblings revealed with `peer-*` state selectors.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    hideLabel,
    helperText,
    error,
    required,
    disabled,
    indeterminate = false,
    id: idProp,
    className,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(idProp);
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  // `indeterminate` is a DOM property with no HTML attribute.
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cn("flex items-start gap-sm", className)}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          ref={innerRef}
          id={ids.id}
          type="checkbox"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helperText, error }, ariaDescribedBy)}
          className={cn(
            "peer size-5 shrink-0 cursor-pointer appearance-none rounded-control border border-solid",
            "border-border-input bg-background-primary",
            "checked:border-action-primary checked:bg-action-primary",
            "indeterminate:border-action-primary indeterminate:bg-action-primary",
            "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
            "aria-invalid:border-feedback-error",
            "disabled:cursor-not-allowed disabled:border-border-default disabled:bg-background-disabled",
            "transition-colors",
          )}
          {...props}
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-text-on-action peer-[:checked:not(:indeterminate)]:block peer-disabled:text-text-disabled"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-text-on-action peer-indeterminate:block peer-disabled:text-text-disabled"
        >
          <path d="M5 12h14" />
        </svg>
      </span>
      <div className="flex flex-col gap-xs">
        <FieldLabel
          htmlFor={ids.id}
          label={label}
          hideLabel={hideLabel}
          required={required}
          disabled={disabled}
        />
        <FieldMessage ids={ids} helperText={helperText} error={error} />
      </div>
    </div>
  );
});
