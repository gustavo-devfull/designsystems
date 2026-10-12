import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { FieldLabel, FieldMessage, describedBy, useFieldIds } from "../Field";
import type { SwitchProps } from "./Switch.types";

/**
 * On/off setting that applies immediately. Rendered as `<input type="checkbox" role="switch">`:
 * Space toggles it, and assistive technology announces "switch, on/off".
 * Use Checkbox instead when the value is only submitted with a form.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    hideLabel,
    helperText,
    error,
    required,
    disabled,
    id: idProp,
    className,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(idProp);
  return (
    <div className={cn("flex items-start gap-sm", className)}>
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          id={ids.id}
          type="checkbox"
          role="switch"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helperText, error }, ariaDescribedBy)}
          className={cn(
            "peer h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-pill border border-solid",
            // Unchecked track uses the form-control border colour so it keeps >= 3:1 against the page.
            "border-border-input bg-border-input checked:border-action-primary checked:bg-action-primary",
            "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
            "aria-invalid:border-feedback-error",
            "disabled:cursor-not-allowed disabled:border-border-default disabled:bg-background-tertiary",
            "transition-colors",
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-0.5 top-0.5 size-5 rounded-pill bg-background-primary shadow-low transition-transform peer-checked:translate-x-4 peer-checked:bg-text-on-action peer-disabled:bg-background-disabled"
        />
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
