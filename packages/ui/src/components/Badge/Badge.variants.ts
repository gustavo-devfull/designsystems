import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-xs rounded-pill border border-solid font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-border-default bg-background-tertiary text-text-primary",
        info: "border-feedback-info-border bg-feedback-info-subtle text-feedback-info",
        success: "border-feedback-success-border bg-feedback-success-subtle text-feedback-success",
        warning: "border-feedback-warning-border bg-feedback-warning-subtle text-feedback-warning",
        error: "border-feedback-error-border bg-feedback-error-subtle text-feedback-error",
      },
      size: {
        sm: "px-sm text-xs",
        md: "px-sm py-xs text-sm",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);
