import { createContext, useContext } from "react";

/**
 * Element that overlays (Dialog, Tooltip) portal into. `ThemeProvider scope="element"` provides its
 * wrapper so overlays stay inside the themed subtree; otherwise overlays go to `document.body`.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainerContext) ?? undefined;
}
