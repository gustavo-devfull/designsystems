# @sette/ui

Accessible, themeable React components driven by design tokens. ESM, tree-shakeable, TypeScript-first.

```bash
pnpm add @sette/ui      # or: npm install @sette/ui
```

`react` and `react-dom` (18.3+ or 19) are **peer dependencies**; the package never ships its own copy.

## Quick start

```tsx
import { Button, Input, Card, CardContent, ThemeProvider } from "@sette/ui";
import "@sette/ui/styles.css";

export function App() {
  return (
    <ThemeProvider storageKey="theme">
      <Card>
        <CardContent>
          <Input label="Email" type="email" required />
          <Button variant="primary">Continue</Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

## Styles

| You want…                                          | Import                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Components only                                    | `@sette/ui/styles.css` (compiled; **no reset**, Tailwind not required) |
| Only the CSS variables (your own CSS)              | `@sette/ui/tokens.css` — `--ds-color-action-primary`, `[data-theme]`…  |
| Your own Tailwind utilities that match the library | `@sette/ui/tailwind.css` (`@theme inline`) in your Tailwind v4 entry   |

```css
/* app.css — an app with its own Tailwind v4 */
@import "@sette/ui/styles.css";
@import "@sette/ui/tailwind.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
```

Utilities are **semantic**, never physical colours: `bg-action-primary`, `text-text-secondary`, `border-border-default`,
`rounded-control`, `p-md`. `bg-blue-500` generates nothing by design.

## Theming

Light and dark are modes of the semantic tokens; components never branch on theme. `ThemeProvider` follows the OS by default,
persists the choice (`storageKey`) and scopes to the document or to an element (`scope="element"`; overlays such as Dialog and
Tooltip stay inside the themed element). Without the provider, set `data-theme="light|dark"` yourself.

## Components

Button · IconButton · Input · Textarea · Select · Checkbox · Radio / RadioGroup · Switch · Badge · Alert · Card · Avatar ·
Divider · Spinner · Dialog · Tooltip · Tabs · ThemeProvider.

All forms controls require a `label` (use `hideLabel` to hide it visually); `IconButton` requires `aria-label` — enforced by
TypeScript.

## Good to know

- **Tree shaking**: modules are preserved and `sideEffects` is `["**/*.css"]`. Importing one component does not pull in the rest
  (or Radix). Every component carries `tailwind-merge` (~28 KB minified) so `className` overrides resolve conflicts predictably.
- **React Server Components / Next.js**: component modules start with `"use client"`; helpers (`cn`, `*Variants`) do not, so they
  stay callable on the server.
- **SSR**: components render on the server; `ThemeProvider` falls back to light when `matchMedia` is unavailable.
- **ESM only**. CommonJS consumers use `import()`.
- **TypeScript**: works with `moduleResolution` `bundler`, `node16` and `nodenext` (verified in CI against the packed tarball).

## Accessibility

WCAG 2.2 AA is the baseline. Every story is rendered in Chromium in light and dark and checked with axe-core on every pull
request; colour pairs are contrast-validated at the token layer. Keyboard behaviour (Dialog focus trap and return, Tabs arrow
keys, RadioGroup roving, Tooltip on focus) is covered by tests.

## Versioning

Semantic Versioning with generated changelogs ([Changesets](https://github.com/changesets/changesets)). See the repository's
`docs/releasing.md` for what counts as a breaking change.

MIT licensed.
