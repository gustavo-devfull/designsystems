import type { InputHTMLAttributes } from "react";
import type { FieldBaseProps } from "../Field/Field.types";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role">, FieldBaseProps {
  /** Class for the outer wrapper. */
  className?: string;
}
