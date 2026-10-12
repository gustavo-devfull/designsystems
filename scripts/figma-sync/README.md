# Figma sync

Figma Variables → DTCG tokens → (validate) → Style Dictionary. The Figma file is the source of truth for
**colour, spacing, radius, border width, size, breakpoints and component tokens**. Shadows, typography and motion are
**code-owned**: Figma variables cannot hold composite values (shadows are Effect Styles), so the sync never touches them.

```
FigmaClient ──► convert() ──► compare with packages/tokens/src ──► write (owned groups only) ──► prettier ──► tokens build
 (HTTP | fixture)  pure, aggregates          drift report                merge, never overwrite      validate: layers, theme parity, WCAG
```

## Usage

```bash
cp .env.example .env            # FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY (never commit real values)
pnpm figma:sync                 # fetch → convert → write → validate → build
pnpm figma:check                # same, but writes nothing; exit 1 if the repo drifted from Figma (use in CI)

# Offline (no credentials): what a correctly set-up Figma file returns for today's tokens
pnpm --filter @design-system/figma-sync sync --fixture scripts/figma-sync/src/fixtures/figma-local-variables.json --check
pnpm --filter @design-system/figma-sync fixture      # regenerate that fixture from packages/tokens/src
```

Exit codes: `0` ok · `1` drift (`--check`) · `2` the Figma file breaks a naming/type rule (all problems are listed) · `3` Figma API error.

> The variables REST API (`GET /v1/files/:key/variables/local`) requires an **Enterprise** organisation and a token with the
> `file_variables:read` scope. Credentials come only from the environment; the token is sent in a header and never logged.

## How the Figma file must be set up

This is the contract. The fixture and the round-trip test are its executable form.

| Collection   | Modes           | Holds                                                                                                                                                  |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Primitives` | one             | `color/*`, `spacing/*`, `radius/*`, `border-width/*` (raw values, no aliases)                                                                          |
| `Semantic`   | `Light`, `Dark` | `color/*` aliases to primitives (a value in **every** mode); `spacing/*`, `radius/*`, `size/*`, `border-width/*`, `breakpoint/*` aliases to primitives |
| `Components` | one             | `button/*`, `input/*`… aliases to Semantic variables                                                                                                   |

- **Names**: slash paths of lowercase letters, digits and hyphens (`color/action/primary/hover`). A group's own value is
  the segment `DEFAULT` (`color/action/primary/DEFAULT` → DTCG `color.action.primary.$root` → `--ds-color-action-primary`).
- **Types**: `COLOR` → `color`; `FLOAT` → `dimension`. `STRING`/`BOOLEAN` are rejected.
- **Units**: Figma floats are px → `rem` (÷ 16). Exceptions: `border-width/*` stays `px`; `radius/*` ≥ 1000 stays `px` (the pill, `9999px`).
- **Descriptions** become `$description`. For mode-specific colours the description lives in the default mode's file.
- **Modes** become theme files: `Light` → `semantic/color.light.json`, `Dark` → `color.dark.json`. A new mode (e.g. `Brand A`) generates
  `color.brand-a.json`; register it in `packages/tokens/build/config.ts` (`THEMES`) to emit CSS for it.
- **Aliases** must point to variables in this file (not remote libraries).

## Ownership and safety

| File                                        | Figma owns (replaced)                                     | Preserved                 |
| ------------------------------------------- | --------------------------------------------------------- | ------------------------- |
| `primitive/color.json`                      | `color`                                                   | —                         |
| `primitive/dimension.json`                  | `spacing`, `radius`, `border-width`                       | —                         |
| `semantic/color.<mode>.json`                | `color`                                                   | —                         |
| `semantic/shared.json`                      | `spacing`, `radius`, `size`, `border-width`, `breakpoint` | `elevation`, `transition` |
| `component/<name>.json`                     | `<name>`                                                  | —                         |
| `primitive/typography.json`, `effects.json` | nothing                                                   | everything                |

A sync only writes when owned tokens actually differ (compared by name, type, value and description, not by formatting),
so it is idempotent. After writing, `tokens build` runs the validator: a Figma change that breaks a layer rule, theme parity
or WCAG contrast fails here, **before** it can reach a pull request.

## Automation

`.github/workflows/figma-sync.yml` (scheduled, **inactive** until `FIGMA_SYNC_ENABLED=true`) runs the sync and opens a PR on
change. See the workflow header for the three setup steps.
