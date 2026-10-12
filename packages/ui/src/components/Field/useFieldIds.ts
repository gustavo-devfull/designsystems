import { useId } from "react";

export interface FieldIds {
  id: string;
  helperId: string;
  errorId: string;
}

/** Stable, SSR-safe ids. A consumer-provided `id` wins and still derives helper/error ids from it. */
export function useFieldIds(idProp?: string): FieldIds {
  const generated = useId();
  const id = idProp ?? generated;
  return { id, helperId: `${id}-helper`, errorId: `${id}-error` };
}

/** The id of the message currently displayed (error replaces helper), for `aria-describedby`. */
export function describedBy(
  { helperId, errorId }: FieldIds,
  { helperText, error }: { helperText?: unknown; error?: unknown },
  extra?: string,
): string | undefined {
  const own = error ? errorId : helperText ? helperId : undefined;
  return [extra, own].filter(Boolean).join(" ") || undefined;
}
