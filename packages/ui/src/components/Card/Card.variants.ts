import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "flex flex-col rounded-surface bg-background-elevated text-text-primary",
  {
    variants: {
      variant: {
        outline: "border border-solid border-border-default",
        elevated: "border border-solid border-border-default shadow-mid",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);
