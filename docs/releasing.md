# Releasing `@sette/ui`

Semantic Versioning, driven by [Changesets](https://github.com/changesets/changesets): contributors declare the **intent** of a
change; versions and `CHANGELOG.md` are generated from it, never edited by hand.

## What is published

| Package                 | Published?   | Why                                                                                      |
| ----------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `@sette/ui`             | **yes**      | The product. Contains the compiled tokens (CSS), so consumers need nothing else.         |
| `@design-system/tokens` | no (private) | Build-time source of the CSS/Tailwind theme. Publishing it standalone is a roadmap item. |
| `@design-system/icons`  | no (private) | Used by Storybook and the playground. Publishing is a roadmap item.                      |
| apps, `scripts/*`       | no           | Ignored by Changesets.                                                                   |

> **Rule:** `@sette/ui` ships the _output_ of tokens and icons. A change to either that alters what consumers get (a colour, a
> spacing value, a new token) **must also include `@sette/ui` in its changeset**: workspace devDependencies do not bump
> dependents automatically.

## What counts as a breaking change (major)

| Area       | Breaking                                                                                                                                          | Not breaking (minor/patch)                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Components | Removing/renaming a component, prop or variant value; changing a prop's type to a narrower one; changing default behaviour (e.g. `type="button"`) | Adding a component, an optional prop or a variant                                                    |
| DOM/ARIA   | Changing roles, the label/description wiring, keyboard behaviour, or element types consumers may style or query                                   | Fixing an accessibility bug toward the spec (patch/minor, call it out)                               |
| Tokens/CSS | Removing or renaming a CSS variable (`--ds-*`), a Tailwind utility or a `data-theme` value; changing a semantic token's meaning                   | Adding tokens; changing a value within its role (e.g. a shade) — **minor**, note it in the changeset |
| Package    | Raising the `react` peer range floor, Node floor, dropping an export entry (`./styles.css`…), changing module format                              | Widening peer ranges                                                                                 |
| Types      | Changes that make previously valid consumer code fail to compile                                                                                  | Widening accepted types                                                                              |

When in doubt, treat it as breaking. A visual change that most consumers would call a regression (not just a refresh) is also major.

## Contributor flow

1. Make the change. If it touches `@sette/ui` (or the tokens/icons it ships): `pnpm changeset`, pick `@sette/ui`, choose
   patch / minor / major and write the user-facing summary (not the commit message).
2. Open the PR. CI fails if published code changed without a changeset (`pnpm changeset status`); use
   `pnpm changeset add --empty` for changes that need no release (docs, tests, tooling).
3. Merge. Changesets accumulate on `main`.

## Release flow (automated, inactive until enabled)

1. On every push to `main`, `.github/workflows/release.yml` opens or updates the **"chore: version packages"** PR: it bumps the
   version, writes the changelog and removes the consumed changesets.
2. Merging that PR publishes `@sette/ui` to npm with **provenance** and creates the git tag.
3. Before anything is published the workflow re-runs the package contract: `publint --strict`, `attw`, and the consumer smoke test.

Enable it by following the header of the workflow (npm scope ownership, `NPM_TOKEN`, `RELEASE_ENABLED=true`).

## The package contract (checked on every PR)

`pnpm check:package` and `pnpm --filter @sette/ui test:package` run in CI against the **packed tarball** (`pnpm pack`, which
resolves `catalog:`/`workspace:`; plain `npm pack` would ship an uninstallable manifest):

- `publint --strict` and `attw` (types resolve under `node16`/`nodenext` and bundlers; relative type imports are made explicit by
  `build/fix-dts-extensions.mjs`).
- Only `dist/`, README, LICENSE and `package.json` are shipped; no tests/stories; size budget.
- Installed into an empty project: SSR render, every export resolves, a single copy of React, a Badge-only bundle contains no
  Radix and is a small share of the library, and a strict `nodenext` TypeScript consumer compiles (and rejects invalid usage).

## Pre-releases and hotfixes

- Pre-release: `pnpm changeset pre enter next` → merge → publishes `x.y.z-next.n` under the `next` tag → `pnpm changeset pre exit`.
- Hotfix: branch from the tag, add a patch changeset, run the same flow.

## Deprecating

Deprecate in a **minor** (keep working, document the replacement, add a `console.warn` in development when practical), keep for
at least one minor release cycle, remove in the next **major**. Record it in the changeset so the changelog says so.
