import { getTokens } from "./tokens";
import { Swatch } from "./Swatch";

/** Primitive colour ramps (private layer — components never reference these directly). */
export function ColorRamps() {
  const colors = getTokens().filter((t) => t.layer === "primitive" && t.type === "color");
  const ramps = new Map<string, typeof colors>();
  for (const t of colors) {
    const ramp = t.name.split(".")[1] ?? "";
    ramps.set(ramp, [...(ramps.get(ramp) ?? []), t]);
  }
  return (
    <div className="flex flex-col gap-lg">
      {[...ramps].map(([ramp, tokens]) => (
        <section key={ramp} aria-label={`${ramp} ramp`}>
          <h3 className="mb-sm text-md font-semibold capitalize">{ramp}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-sm">
            {tokens.map((t) => (
              <li key={t.name} className="flex flex-col gap-xs text-xs">
                <Swatch value={String(t.value)} label={t.name} />
                <code>{t.name.split(".").slice(2).join(".") || ramp}</code>
                <span className="text-text-secondary">{String(t.value)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
