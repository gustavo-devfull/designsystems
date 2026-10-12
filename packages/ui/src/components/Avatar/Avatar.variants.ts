import { cva } from "class-variance-authority";

export const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-pill bg-background-tertiary font-medium text-text-primary",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-md",
        xl: "size-16 text-xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);
