import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Field, controlVariants, describedBy, useFieldIds } from "../Field";
import type { InputProps } from "./Input.types";

/** Single-line text field. `ref` and all native attributes go to the `<input>`. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hideLabel,
    helperText,
    error,
    required,
    disabled,
    size = "md",
    id: idProp,
    type = "text",
    className,
    inputClassName,
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
      <input
        ref={ref}
        id={ids.id}
        type={type}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { helperText, error }, ariaDescribedBy)}
        data-size={size}
        className={cn(controlVariants({ size }), inputClassName)}
        {...props}
      />
    </Field>
  );
});
