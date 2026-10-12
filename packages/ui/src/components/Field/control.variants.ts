import { cva } from "class-variance-authority";

/** Visual contract shared by Input, Textarea and Select (uses the `--ds-input-*` component tokens). */
export const controlVariants = cva(
  [
    "block w-full rounded-control border border-solid font-sans",
    "border-input-border-default bg-input-background-default text-input-text-default",
    "placeholder:text-input-text-placeholder",
    "outline-focus-ring focus-visible:border-input-border-focus focus-visible:outline-2",
    "aria-invalid:border-input-border-error",
    "disabled:cursor-not-allowed disabled:border-input-border-disabled disabled:bg-input-background-disabled disabled:text-input-text-disabled",
    "transition-colors",
  ],
  {
    variants: {
      size: {
        sm: "h-control-sm px-sm text-sm",
        md: "h-control-md px-md text-md",
        lg: "h-control-lg px-md text-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);
