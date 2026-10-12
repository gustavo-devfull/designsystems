import type { HTMLAttributes } from "react";

export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "role"> {
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * Purely visual (no semantic meaning): hidden from assistive technology. Use when a heading or
   * spacing already separates the content. Leave `false` when the break is meaningful.
   * @default false
   */
  decorative?: boolean;
}
