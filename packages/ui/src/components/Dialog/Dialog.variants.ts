import { cva } from "class-variance-authority";

export const dialogContentVariants = cva(
  [
    "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] -translate-x-1/2 -translate-y-1/2 flex-col gap-md overflow-y-auto",
    // Viewport minus a gutter on each side; never wider than the chosen size.
    "w-[calc(100vw-2*var(--ds-spacing-md))]",
    "rounded-surface border border-solid border-border-default bg-background-elevated p-lg text-text-primary shadow-high",
    "outline-none",
  ],
  {
    variants: {
      size: {
        sm: "max-w-dialog-sm",
        md: "max-w-dialog-md",
        lg: "max-w-dialog-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);
