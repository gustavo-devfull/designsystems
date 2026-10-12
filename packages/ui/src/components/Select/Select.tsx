import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Field, controlVariants, describedBy, useFieldIds } from "../Field";
import type { SelectProps } from "./Select.types";

/**
 * Native `<select>` with the design-system look. A native control keeps platform keyboard
 * handling, typeahead and the mobile picker for free; children are regular `<option>`s.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hideLabel,
    helperText,
    error,
    required,
    disabled,
    size = "md",
    placeholder,
    id: idProp,
    className,
    selectClassName,
    children,
    value,
    defaultValue,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const ids = useFieldIds(idProp);
  const uncontrolledDefault =
    value === undefined && defaultValue === undefined && placeholder !== undefined
      ? ""
      : defaultValue;
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
      <div className="relative">
        <select
          ref={ref}
          id={ids.id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helperText, error }, ariaDescribedBy)}
          data-size={size}
          value={value}
          defaultValue={uncontrolledDefault}
          className={cn(
            controlVariants({ size }),
            "appearance-none pe-xl",
            "[&:has(option[value='']:checked)]:text-input-text-placeholder [&>option]:text-input-text-default",
            selectClassName,
          )}
          {...props}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className={cn(
            "pointer-events-none absolute end-md top-1/2 size-4 -translate-y-1/2 text-text-secondary",
            disabled && "text-input-text-disabled",
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </Field>
  );
});
