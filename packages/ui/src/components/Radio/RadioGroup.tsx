import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import { FieldMessage, describedBy, useFieldIds } from "../Field";
import type { RadioGroupProps } from "./Radio.types";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  select: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export const useRadioGroup = () => useContext(RadioGroupContext);

/**
 * `<fieldset role="radiogroup">` + `<legend>`. Radios share a `name`, so the browser provides the
 * roving behaviour: Tab enters the group once, arrow keys move and select, Shift+Tab leaves.
 */
export function RadioGroup({
  legend,
  hideLegend,
  name,
  value,
  defaultValue,
  onValueChange,
  helperText,
  error,
  required = false,
  disabled = false,
  orientation = "vertical",
  id,
  className,
  children,
}: RadioGroupProps) {
  const ids = useFieldIds(id);
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  const select = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const context = useMemo<RadioGroupContextValue>(
    () => ({
      name: name ?? ids.id,
      value: current,
      disabled,
      required,
      invalid: Boolean(error),
      select,
    }),
    [name, ids.id, current, disabled, required, error, select],
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <fieldset
        role="radiogroup"
        id={ids.id}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { helperText, error })}
        className={cn("m-0 flex min-w-0 flex-col gap-xs border-0 p-0", className)}
      >
        <legend
          className={cn("mb-xs p-0 text-sm font-medium text-text-primary", hideLegend && "sr-only")}
        >
          {legend}
          {required ? (
            <span aria-hidden="true" className="ms-xs text-feedback-error">
              *
            </span>
          ) : null}
        </legend>
        <div
          className={cn(
            "flex gap-md",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          )}
        >
          {children}
        </div>
        <FieldMessage ids={ids} helperText={helperText} error={error} />
      </fieldset>
    </RadioGroupContext.Provider>
  );
}
