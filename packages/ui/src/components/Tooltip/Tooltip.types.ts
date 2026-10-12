import type { ReactElement, ReactNode } from "react";

export interface TooltipProps {
  /** Plain text/phrasing content. Never put links, buttons or other interactive content in a tooltip. */
  content: ReactNode;
  /** The trigger. Must be a single focusable element (Button, IconButton, link…); it receives the tooltip behaviour. */
  children: ReactElement;
  /** @default "top" */
  side?: "top" | "right" | "bottom" | "left";
  /** @default "center" */
  align?: "start" | "center" | "end";
  /** Delay before opening, in ms. @default 300 */
  delayDuration?: number;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
