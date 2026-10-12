import type { InputHTMLAttributes, ReactNode } from "react";
import type { FieldBaseProps } from "../Field/Field.types";

export interface RadioProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "name">,
    Pick<FieldBaseProps, "label" | "hideLabel" | "helperText" | "disabled"> {
  /** Value submitted and reported to the group when selected. */
  value: string;
  className?: string;
}

export interface RadioGroupProps {
  /** Group name, announced by screen readers (rendered as a `<legend>`). */
  legend: ReactNode;
  hideLegend?: boolean;
  /** Form field name shared by every radio. Generated when omitted. */
  name?: string;
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** @default "vertical" */
  orientation?: "vertical" | "horizontal";
  id?: string;
  className?: string;
  children: ReactNode;
}
