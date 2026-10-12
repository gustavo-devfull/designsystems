import { byPrefix } from "./tokens";

export function TypeScale() {
  const samples = byPrefix("font.size.");
  return (
    <ul className="flex flex-col gap-md">
      {samples.map((t) => (
        <li
          key={t.name}
          className="flex items-baseline gap-lg border-b border-border-default pb-sm"
        >
          <code className="w-48 shrink-0 text-xs">{t.cssVar}</code>
          <span className="w-16 shrink-0 text-xs text-text-secondary">{t.value}</span>
          <span style={{ fontSize: `var(${t.cssVar})` }}>
            The quick brown fox jumps over the lazy dog
          </span>
        </li>
      ))}
    </ul>
  );
}

export function FontFamilies() {
  return (
    <ul className="flex flex-col gap-md">
      {byPrefix("font.family.").map((t) => (
        <li key={t.name}>
          <code className="text-xs">{t.cssVar}</code>
          <p className="text-xl" style={{ fontFamily: `var(${t.cssVar})` }}>
            Sphinx of black quartz, judge my vow — 0123456789
          </p>
        </li>
      ))}
    </ul>
  );
}

export function FontWeights() {
  return (
    <ul className="flex flex-wrap gap-lg">
      {byPrefix("font.weight.").map((t) => (
        <li key={t.name} className="flex flex-col">
          <span className="text-xl" style={{ fontWeight: `var(${t.cssVar})` }}>
            Aa
          </span>
          <code className="text-xs">
            {t.name.replace("font.weight.", "")} · {t.value}
          </code>
        </li>
      ))}
    </ul>
  );
}

export function SpacingScale({ semantic = false }: { semantic?: boolean }) {
  const tokens = byPrefix("spacing.").filter((t) => (t.layer === "semantic") === semantic);
  return (
    <ul className="flex flex-col gap-sm">
      {tokens.map((t) => (
        <li key={t.name} className="flex items-center gap-md">
          <code className="w-48 shrink-0 text-xs">{t.cssVar}</code>
          <span className="w-16 shrink-0 text-xs text-text-secondary">{t.value}</span>
          <span
            className="h-4 rounded-control bg-action-primary"
            style={{ width: `var(${t.cssVar})` }}
          />
        </li>
      ))}
    </ul>
  );
}

export function RadiusScale() {
  const tokens = byPrefix("radius.");
  return (
    <ul className="flex flex-wrap gap-lg">
      {tokens.map((t) => (
        <li key={t.name} className="flex flex-col items-center gap-sm text-xs">
          <span
            className="size-16 border border-border-strong bg-background-secondary"
            style={{ borderRadius: `var(${t.cssVar})` }}
          />
          <code>{t.name.replace("radius.", "")}</code>
          <span className="text-text-secondary">{t.layer}</span>
        </li>
      ))}
    </ul>
  );
}

export function ShadowScale() {
  const tokens = byPrefix("elevation.");
  return (
    <ul className="flex flex-wrap gap-xl p-md">
      {tokens.map((t) => (
        <li key={t.name} className="flex flex-col items-center gap-sm text-xs">
          <span
            className="size-24 rounded-surface bg-background-elevated"
            style={{ boxShadow: `var(${t.cssVar})` }}
          />
          <code>{t.cssVar}</code>
        </li>
      ))}
    </ul>
  );
}
