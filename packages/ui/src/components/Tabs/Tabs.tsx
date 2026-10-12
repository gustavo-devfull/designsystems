import * as RadixTabs from "@radix-ui/react-tabs";
import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps } from "./Tabs.types";

/**
 * Tabs (horizontal). Radix implements the WAI-ARIA tabs pattern: roving tabindex (Tab enters the
 * list once, then moves into the active panel), arrow keys, Home/End, and the
 * `aria-controls`/`aria-labelledby` relationships between tabs and panels.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, ...props },
  ref,
) {
  return <RadixTabs.Root ref={ref} className={cn("flex flex-col", className)} {...props} />;
});

/** Give the list an accessible name with `aria-label` when the context does not already provide one. */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, ...props },
  ref,
) {
  return (
    <RadixTabs.List
      ref={ref}
      className={cn("flex shrink-0 gap-xs border-b border-solid border-border-default", className)}
      {...props}
    />
  );
});

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { className, ...props },
  ref,
) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        "-mb-px inline-flex h-control-md items-center justify-center whitespace-nowrap border-b-2 border-solid border-transparent px-md font-sans text-md font-medium",
        "text-text-secondary transition-colors hover:text-text-primary",
        "data-[state=active]:border-b-action-primary data-[state=active]:text-text-primary",
        "outline-focus-ring focus-visible:outline-2 focus-visible:-outline-offset-2",
        "disabled:cursor-not-allowed disabled:text-text-disabled",
        className,
      )}
      {...props}
    />
  );
});

/** Panels are focusable (tabindex=0) so keyboard users can reach panels that have no focusable content. */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, ...props },
  ref,
) {
  return (
    <RadixTabs.Content
      ref={ref}
      className={cn(
        "pt-md text-text-primary outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
});
