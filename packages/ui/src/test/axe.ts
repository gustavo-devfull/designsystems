import { configureAxe } from "vitest-axe";

/**
 * axe configuration shared by every component test.
 * `color-contrast` is disabled because jsdom has no layout/CSS engine; contrast is guaranteed
 * at the token layer (`pnpm --filter @design-system/tokens validate`) and by the Storybook a11y addon.
 * `region` is a page-level rule (all content inside landmarks); an isolated component or a
 * portal (Dialog, Tooltip) is never inside `<main>` in a unit test.
 */
export const axe = configureAxe({
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
});
