import type { ReactNode } from "react";

/** Props shared by every form control. Keeps naming and behaviour identical across components. */
export interface FieldBaseProps {
  /**
   * Visible label. Required: every control needs an accessible name.
   * Use `hideLabel` to keep it for assistive technology only.
   */
  label: ReactNode;
  /** Hide the label visually (it stays available to screen readers). */
  hideLabel?: boolean;
  /** Supporting text, announced with the control through `aria-describedby`. */
  helperText?: ReactNode;
  /**
   * Validation message. When set, the control is marked `aria-invalid`, the message replaces the
   * helper text and is announced politely when it appears.
   */
  error?: ReactNode;
  /** Marks the control as required (native `required` + a visual asterisk). */
  required?: boolean;
  disabled?: boolean;
}

export type ControlSize = "sm" | "md" | "lg";
