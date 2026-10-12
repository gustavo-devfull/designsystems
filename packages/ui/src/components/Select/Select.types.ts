import type { SelectHTMLAttributes } from "react";
import type { ControlSize, FieldBaseProps } from "../Field/Field.types";

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">, FieldBaseProps {
  /** Control height scale. Figma: `Size`. @default "md" */
  size?: ControlSize;
  /**
   * Empty first option (`value=""`). Selected by default when the select is uncontrolled and
   * makes `required` meaningful.
   */
  placeholder?: string;
  className?: string;
  selectClassName?: string;
}
