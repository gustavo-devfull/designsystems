import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { FieldBaseProps } from "./Field.types";
import type { FieldIds } from "./useFieldIds";

interface FieldMessageProps extends Pick<FieldBaseProps, "helperText" | "error"> {
  ids: FieldIds;
}

/**
 * Helper/error text. The live region is always mounted so that an error appearing later is
 * announced (regions added together with their content are often ignored by screen readers).
 */
export function FieldMessage({ ids, helperText, error }: FieldMessageProps) {
  return (
    <div aria-live="polite">
      {error ? (
        <p id={ids.errorId} className="text-sm text-feedback-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={ids.helperId} className="text-sm text-text-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

interface FieldLabelProps extends Pick<
  FieldBaseProps,
  "label" | "hideLabel" | "required" | "disabled"
> {
  htmlFor: string;
  className?: string;
}

export function FieldLabel({
  label,
  hideLabel,
  required,
  disabled,
  htmlFor,
  className,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-text-primary",
        disabled && "text-text-disabled",
        hideLabel && "sr-only",
        className,
      )}
    >
      {label}
      {required ? (
        // The native `required` attribute is what assistive tech announces; the asterisk is visual.
        <span aria-hidden="true" className="ms-xs text-feedback-error">
          *
        </span>
      ) : null}
    </label>
  );
}

interface FieldProps extends FieldBaseProps {
  ids: FieldIds;
  className?: string;
  children: ReactNode;
}

/** Label + control + message stack used by Input, Textarea and Select. */
export function Field({
  ids,
  label,
  hideLabel,
  required,
  disabled,
  helperText,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <FieldLabel
        htmlFor={ids.id}
        label={label}
        hideLabel={hideLabel}
        required={required}
        disabled={disabled}
      />
      {children}
      <FieldMessage ids={ids} helperText={helperText} error={error} />
    </div>
  );
}
