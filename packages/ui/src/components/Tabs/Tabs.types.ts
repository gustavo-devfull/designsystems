import type * as RadixTabs from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef } from "react";

export interface TabsProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixTabs.Root>,
  "orientation"
> {
  /**
   * `automatic` (default): arrow keys move focus **and** select the tab.
   * `manual`: arrows only move focus; Enter/Space selects. Use when panels are slow to render.
   */
  activationMode?: "automatic" | "manual";
}
export type TabsListProps = ComponentPropsWithoutRef<typeof RadixTabs.List>;
export type TabsTriggerProps = ComponentPropsWithoutRef<typeof RadixTabs.Trigger>;
export type TabsContentProps = ComponentPropsWithoutRef<typeof RadixTabs.Content>;
