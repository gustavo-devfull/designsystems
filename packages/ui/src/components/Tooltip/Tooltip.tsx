import * as RadixTooltip from "@radix-ui/react-tooltip";
import { usePortalContainer } from "../../theme/portal";
import type { TooltipProps } from "./Tooltip.types";

/**
 * Optional app-level provider: share the open delay across tooltips so moving between triggers is
 * instant. Each `Tooltip` also works on its own.
 */
export const TooltipProvider = RadixTooltip.Provider;

/**
 * Supplementary description shown on hover **and keyboard focus**. Dismissible with `Esc`,
 * hoverable and persistent while hovered or focused (WCAG 1.4.13). It describes the trigger via
 * `aria-describedby`; it does not replace its accessible name, so icon-only controls still need
 * an `aria-label`.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 300,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const container = usePortalContainer();
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal container={container}>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={6}
            className="z-50 max-w-dialog-sm rounded-control bg-background-inverse px-sm py-xs text-sm text-text-inverse shadow-mid"
          >
            {content}
            <RadixTooltip.Arrow aria-hidden="true" className="fill-background-inverse" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
