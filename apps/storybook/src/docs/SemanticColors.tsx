import { colorUtility, getTokens } from "./tokens";
import { Swatch } from "./Swatch";

/** Semantic colour roles resolved for both themes side by side, regardless of the active theme. */
export function SemanticColors({ group }: { group?: string }) {
  const light = getTokens("light").filter(
    (t) =>
      t.layer === "semantic" &&
      t.type === "color" &&
      (!group || t.name.startsWith(`color.${group}.`)),
  );
  const dark = new Map(getTokens("dark").map((t) => [t.name, t]));
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Tailwind</th>
          <th scope="col">Light</th>
          <th scope="col">Dark</th>
        </tr>
      </thead>
      <tbody>
        {light.map((t) => (
          <tr key={t.name}>
            <td>
              <code>{t.cssVar}</code>
              {t.description ? (
                <div className="text-xs text-text-secondary">{t.description}</div>
              ) : null}
            </td>
            <td>
              <code>{colorUtility(t)}</code>
            </td>
            <td>
              <span className="inline-flex items-center gap-sm">
                <Swatch value={String(t.value)} label={`${t.name} light`} />
                <code>{String(t.value)}</code>
              </span>
            </td>
            <td>
              <span className="inline-flex items-center gap-sm">
                <Swatch value={String(dark.get(t.name)?.value)} label={`${t.name} dark`} />
                <code>{String(dark.get(t.name)?.value)}</code>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
