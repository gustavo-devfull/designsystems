import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Field, controlVariants, describedBy, useFieldIds } from "../Field";
import type { TextareaProps } from "./Textarea.types";

/** Multi-line text field. Grows with `rows` and is vertically resizable. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hideLabel,
    helperText,
    error,
    required,
    disabled,
    size = "md",
    rows = 4,
    id: idProp,
    className,
    textareaClassName,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(idProp);
  return (
    <Field
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      required={required}
      disabled={disabled}
      helperText={helperText}
      error={error}
      className={className}
    >
      <textarea
        ref={ref}
        id={ids.id}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { helperText, error }, ariaDescribedBy)}
        data-size={size}
        // Height comes from `rows`, not from the single-line control height.
        className={cn(controlVariants({ size }), "h-auto resize-y py-sm", textareaClassName)}
        {...props}
      />
    </Field>
  );
});
