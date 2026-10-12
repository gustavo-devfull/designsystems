# CI strategy

> Pull Request → Install → Lint → Typecheck → Tests → Build → Storybook → **Accessibility gate** → Success

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). One required status check: **CI success**.

| Job          | Runs                                                                                   | Fails when                                                        |
| ------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `check`      | `build:packages` → `lint` → `typecheck` → `test`                                       | lint/type/test error; token validation (layers, parity, contrast) |
| `build`      | `pnpm build` (tokens, icons, ui, playground) → `build-storybook`                       | any build error                                                   |
| `a11y`       | Playwright + axe-core over **every story** (light + dark) and the playground scenarios | a story throws, or any `serious`/`critical` WCAG 2.2 AA violation |
| `ci-success` | aggregates the above                                                                   | any job not successful                                            |

## Why the order is not literally "lint first"

Type-aware ESLint, `tsc`, the playground and the tests import the **built** workspace packages (their `dist/*.d.ts`).
On a clean checkout those do not exist, so each job builds the packages once (`pnpm build:packages`) before it checks
anything. Locally, `pre*` hooks do the same so `pnpm lint` works from a fresh clone; CI disables the hooks
(`npm_config_enable_pre_post_scripts=false`) to avoid rebuilding three times.

## Layers of accessibility defence

1. **Static**: `eslint-plugin-jsx-a11y` on every TSX file.
2. **Unit** (`pnpm a11y:unit`): `vitest-axe` per component/state in jsdom (labels, roles, ARIA wiring, keyboard tests).
   jsdom has no layout, so colour contrast is disabled there.
3. **Tokens** (`pnpm tokens:build`): WCAG contrast of every relevant colour pair, per theme, validated at build time.
4. **Browser gate** (`pnpm a11y`): the real thing — all stories rendered in Chromium in both themes, `play` functions
   executed, axe-core with WCAG 2.2 AA + best-practice rules including real colour contrast. Also the playground in
   eight scenarios (tabs, validation errors, open dialogs, open tooltip), with page-level rules enabled.

### The browser gate in detail (`scripts/a11y`)

- Serves `storybook-static` and the playground `dist` itself (no external server), launches Chromium, and runs
  a **self-test first**: a fixture with known violations must be reported, otherwise the run aborts ("the gate is blind").
- A story fails if its play function throws, Storybook shows its error screen, or the page raises an uncaught error.
- `--fail-on <minor|moderate|serious|critical>` (default `serious`). Findings below the threshold are printed as
  advisory warnings and do not fail the build.
- Component-level runs disable page-level rules only (`region`, `landmark-one-main`, `page-has-heading-one`, `bypass`);
  landmark duplication/uniqueness stay on (they caught a real `<header>` in the Dialog). The playground runs with all rules.
- Output: console summary + `a11y-report.json` (uploaded as a CI artifact).

```bash
pnpm a11y                                              # build + full gate
pnpm --filter @design-system/a11y sweep --target playground --themes dark
pnpm --filter @design-system/a11y sweep --filter components-dialog --fail-on moderate
```

## Prepared, not active

- **Chromatic** (visual regression): `.github/workflows/chromatic.yml` — manual trigger, guarded by the repository
  variable `CHROMATIC_ENABLED` and the secret `CHROMATIC_PROJECT_TOKEN`. Instructions are in the file header.
- **Changesets / npm publishing**: added with the packaging step.
- **Dependabot**: weekly, grouped by ecosystem (Storybook, Radix, Tailwind, test tooling, Actions).

## Known advisory finding

The Radix tooltip is portalled to `<body>`, outside any landmark; axe reports `region` (moderate) for the open tooltip in
the playground. It is below the gate by design and has no user-facing impact (the tooltip is a transient description).
