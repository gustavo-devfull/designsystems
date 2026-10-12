import { cva } from "class-variance-authority";

/**
 * Every colour/size below is a design-token utility (see @design-system/tokens → tailwind.css).
 * Component tokens: --ds-button-*; semantic scales: control height, spacing, radius, font size.
 */
export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center select-none whitespace-nowrap",
    "rounded-control font-medium",
    "transition-colors",
    "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed aria-busy:cursor-progress",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-button-background-primary text-button-text-primary",
          "hover:bg-button-background-primary-hover active:bg-button-background-primary-active",
          "disabled:bg-button-background-disabled disabled:text-button-text-disabled",
        ],
        secondary: [
          "bg-button-background-secondary text-button-text-secondary",
          "hover:bg-button-background-secondary-hover active:bg-button-background-secondary-active",
          "disabled:bg-button-background-disabled disabled:text-button-text-disabled",
        ],
        danger: [
          "bg-button-background-danger text-button-text-danger",
          "hover:bg-button-background-danger-hover active:bg-button-background-danger-active",
          "disabled:bg-button-background-disabled disabled:text-button-text-disabled",
        ],
        outline: [
          "border border-button-border-outline bg-button-background-outline text-button-text-outline",
          "hover:bg-button-background-outline-hover active:bg-button-background-outline-active",
          "disabled:border-button-border-disabled disabled:bg-button-background-outline disabled:text-button-text-disabled",
        ],
        ghost: [
          "bg-button-background-ghost text-button-text-ghost",
          "hover:bg-button-background-ghost-hover active:bg-button-background-ghost-active",
          "disabled:bg-button-background-ghost disabled:text-button-text-disabled",
        ],
      },
      // Fixed height (not padding-derived) keeps every state — including loading — dimensionally stable.
      size: {
        sm: "h-control-sm px-sm text-sm",
        md: "h-control-md px-md text-md",
        lg: "h-control-lg px-lg text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);
