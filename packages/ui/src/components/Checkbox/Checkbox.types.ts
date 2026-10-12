import type { InputHTMLAttributes } from "react";
import type { FieldBaseProps } from "../Field/Field.types";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">, FieldBaseProps {
  /**
   * Mixed state (e.g. "select all" with a partial selection). Purely visual/ARIA: the user's
   * next click resolves it to checked or unchecked, as with a native checkbox.
   */
  indeterminate?: boolean;
  /** Class for the outer wrapper. */
  className?: string;
}
