import { cva } from "class-variance-authority";

export const spinnerVariants = cva(
  // Reduced motion slows the rotation instead of freezing it, so "busy" stays perceivable.
  "inline-block shrink-0 animate-spin motion-reduce:animate-[spin_2s_linear_infinite]",
  {
    variants: {
      size: { sm: "size-4", md: "size-5", lg: "size-6" },
    },
    defaultVariants: { size: "md" },
  },
);
