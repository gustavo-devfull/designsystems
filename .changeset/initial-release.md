---
"@sette/ui": minor
---

First public release of the Sette design system React library.

- Components: Button, IconButton, Input, Textarea, Select, Checkbox, Radio/RadioGroup, Switch, Badge, Alert, Card, Avatar,
  Divider, Spinner, Dialog, Tooltip, Tabs.
- `ThemeProvider` / `useTheme` with light, dark and system themes (scoped to the document or to an element).
- Token-driven styles: `@sette/ui/styles.css` (components), `@sette/ui/tokens.css` (CSS variables only) and
  `@sette/ui/tailwind.css` (the Tailwind theme, for applications that generate their own utilities).
- ESM only, tree-shakeable, `react`/`react-dom` as peer dependencies, WCAG 2.2 AA verified in CI.
