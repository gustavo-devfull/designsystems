import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "../lib/cn";
import { PortalContainerContext } from "./portal";
import type {
  ResolvedTheme,
  ThemeContextValue,
  ThemePreference,
  ThemeProviderProps,
} from "./ThemeProvider.types";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** `matchMedia` is missing in some test/embedded environments; fall back to "light" there. */
const canMatchMedia = () => typeof window.matchMedia === "function";

function subscribeToSystemTheme(notify: () => void): () => void {
  if (!canMatchMedia()) return () => undefined;
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const getSystemTheme = (): ResolvedTheme =>
  canMatchMedia() && window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
const getServerTheme = (): ResolvedTheme => "light";

function readStoredPreference(key: string | undefined): ThemePreference | undefined {
  if (!key) return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value === "light" || value === "dark" || value === "system" ? value : undefined;
  } catch {
    return undefined; // storage can throw (private mode, blocked cookies)
  }
}

/**
 * Applies a theme by setting `data-theme`; every component reads semantic tokens, so no
 * component is aware of themes. Follows the OS by default (`defaultTheme="system"`).
 *
 * - `scope="document"` (default): sets the attribute on `<html>`.
 * - `scope="element"`: wraps children in a `div[data-theme]` (previews, nested themes).
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey,
  scope = "document",
  className,
}: ThemeProviderProps) {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);
  const [theme, setThemeState] = useState<ThemePreference>(
    () => readStoredPreference(storageKey) ?? defaultTheme,
  );
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, getServerTheme);
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        /* persistence is a convenience, never a requirement */
      }
    },
    [storageKey],
  );

  useEffect(() => {
    if (scope !== "document") return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", resolvedTheme);
    return () => {
      if (previous === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previous);
    };
  }, [scope, resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {scope === "element" ? (
        <div
          ref={setWrapper}
          data-theme={resolvedTheme}
          className={cn("bg-background-primary text-text-primary", className)}
        >
          <PortalContainerContext.Provider value={wrapper}>
            {children}
          </PortalContainerContext.Provider>
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within <ThemeProvider>");
  return context;
}
