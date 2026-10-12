import { cva } from "class-variance-authority";

export const alertVariants = cva(
  "flex items-start gap-sm rounded-surface border border-solid p-md text-text-primary",
  {
    variants: {
      variant: {
        info: "border-feedback-info-border bg-feedback-info-subtle",
        success: "border-feedback-success-border bg-feedback-success-subtle",
        warning: "border-feedback-warning-border bg-feedback-warning-subtle",
        error: "border-feedback-error-border bg-feedback-error-subtle",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export const alertIconColor = {
  info: "text-feedback-info",
  success: "text-feedback-success",
  warning: "text-feedback-warning",
  error: "text-feedback-error",
} as const;
