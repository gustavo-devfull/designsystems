import type { TextareaHTMLAttributes } from "react";
import type { ControlSize, FieldBaseProps } from "../Field/Field.types";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldBaseProps {
  /** Type scale and horizontal padding. Figma: `Size`. @default "md" */
  size?: ControlSize;
  className?: string;
  textareaClassName?: string;
}
