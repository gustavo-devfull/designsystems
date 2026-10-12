import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { FieldLabel, FieldMessage, useFieldIds } from "../Field";
import type { RadioProps } from "./Radio.types";
import { useRadioGroup } from "./RadioGroup";

/** One option of a `RadioGroup`. Must be rendered inside a group (shared name, value, state). */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    hideLabel,
    helperText,
    disabled,
    value,
    id: idProp,
    className,
    onChange,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const group = useRadioGroup();
  if (!group) throw new Error("<Radio> must be used within <RadioGroup>");
  const ids = useFieldIds(idProp);
  const isDisabled = disabled ?? group.disabled;

  return (
    <div className={cn("flex items-start gap-sm", className)}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          ref={ref}
          id={ids.id}
          type="radio"
          name={group.name}
          value={value}
          checked={group.value === value}
          required={group.required}
          disabled={isDisabled}
          aria-describedby={
            [ariaDescribedBy, helperText ? ids.helperId : undefined].filter(Boolean).join(" ") ||
            undefined
          }
          onChange={(event) => {
            group.select(value);
            onChange?.(event);
          }}
          className={cn(
            "peer size-5 shrink-0 cursor-pointer appearance-none rounded-pill border border-solid",
            "border-border-input bg-background-primary",
            "checked:border-action-primary checked:bg-action-primary",
            "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
            group.invalid && "border-feedback-error",
            "disabled:cursor-not-allowed disabled:border-border-default disabled:bg-background-disabled",
            "transition-colors",
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto hidden size-2 rounded-pill bg-text-on-action peer-checked:block peer-disabled:bg-text-disabled"
        />
      </span>
      <div className="flex flex-col gap-xs">
        <FieldLabel htmlFor={ids.id} label={label} hideLabel={hideLabel} disabled={isDisabled} />
        {helperText ? <FieldMessage ids={ids} helperText={helperText} /> : null}
      </div>
    </div>
  );
});
