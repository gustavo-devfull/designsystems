/** Colour chip. The background is data (a token value), so it is the one justified inline style. */
export function Swatch({ value, label }: { value: string; label?: string }) {
  return (
    <span
      role="img"
      aria-label={label ?? value}
      className="inline-block size-8 shrink-0 rounded-control border border-border-default"
      style={{ background: value }}
    />
  );
}
