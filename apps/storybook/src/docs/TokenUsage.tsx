import { colorUtility, getTokens } from "./tokens";
import { Swatch } from "./Swatch";

/** Lists the component tokens (`button.*`, `input.*`) with their Tailwind utility and per-theme value. */
export function TokenUsage({ component }: { component: string }) {
  const light = getTokens("light").filter(
    (t) => t.layer === "component" && t.name.startsWith(`${component}.`),
  );
  const dark = new Map(getTokens("dark").map((t) => [t.name, t]));
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          <th scope="col">Component token</th>
          <th scope="col">Utility</th>
          <th scope="col">Light</th>
          <th scope="col">Dark</th>
        </tr>
      </thead>
      <tbody>
        {light.map((t) => {
          const isColor = t.type === "color";
          return (
            <tr key={t.name}>
              <td>
                <code>{t.cssVar}</code>
              </td>
              <td>{isColor ? <code>{colorUtility(t)}</code> : "—"}</td>
              <td>
                <span className="inline-flex items-center gap-sm">
                  {isColor ? <Swatch value={String(t.value)} label={`${t.name} light`} /> : null}
                  <code>{String(t.value)}</code>
                </span>
              </td>
              <td>
                <span className="inline-flex items-center gap-sm">
                  {isColor ? (
                    <Swatch value={String(dark.get(t.name)?.value)} label={`${t.name} dark`} />
                  ) : null}
                  <code>{String(dark.get(t.name)?.value)}</code>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
