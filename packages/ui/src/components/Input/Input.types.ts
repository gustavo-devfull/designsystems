import type { InputHTMLAttributes } from "react";
import type { ControlSize, FieldBaseProps } from "../Field/Field.types";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, FieldBaseProps {
  /** Control height scale. Figma: `Size`. @default "md" */
  size?: ControlSize;
  /** Class for the outer field wrapper (layout). Use `inputClassName` for the `<input>`. */
  className?: string;
  inputClassName?: string;
}
