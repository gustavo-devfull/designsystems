import { useMemo, useState } from "react";
import { getTokens, type Layer, type Theme } from "./tokens";

const layers: ("all" | Layer)[] = ["all", "primitive", "semantic", "component"];

/** Searchable table of every token (resolved for the chosen theme). */
export function TokenTable() {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<"all" | Layer>("all");
  const [theme, setTheme] = useState<Theme>("light");

  const rows = useMemo(
    () =>
      getTokens(theme).filter(
        (t) =>
          (layer === "all" || t.layer === layer) &&
          (t.name.includes(query.toLowerCase()) ||
            String(t.value).toLowerCase().includes(query.toLowerCase())),
      ),
    [query, layer, theme],
  );

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-end gap-md">
        <label className="flex flex-col gap-xs text-sm">
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="color.action, radius…"
            className="h-control-md rounded-control border border-border-input bg-background-primary px-md text-text-primary placeholder:text-text-placeholder"
          />
        </label>
        <label className="flex flex-col gap-xs text-sm">
          Layer
          <select
            value={layer}
            onChange={(e) => {
              setLayer(e.target.value as "all" | Layer);
            }}
            className="h-control-md rounded-control border border-border-input bg-background-primary px-md text-text-primary"
          >
            {layers.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-xs text-sm">
          Theme values
          <select
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value as Theme);
            }}
            className="h-control-md rounded-control border border-border-input bg-background-primary px-md text-text-primary"
          >
            <option>light</option>
            <option>dark</option>
          </select>
        </label>
        <p className="text-sm text-text-secondary" role="status">
          {rows.length} tokens
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">CSS variable</th>
            <th scope="col">Value ({theme})</th>
            <th scope="col">Layer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.name}>
              <td>
                <code>{t.name}</code>
              </td>
              <td>
                <code>{t.cssVar}</code>
              </td>
              <td>
                <code>{String(t.value)}</code>
              </td>
              <td>{t.layer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
