# Sette Design System

Design System end-to-end: **Figma Variables → Design Tokens → Style Dictionary → CSS Variables →
Tailwind → React + TypeScript → Storybook → Accessibility → Tests → CI/CD → npm package**.

> Status: **Fase 1 — fundação do monorepo**. Veja [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

## Estrutura

| Caminho              | Pacote                      | Papel                          |
| -------------------- | --------------------------- | ------------------------------ |
| `packages/tokens`    | `@design-system/tokens`     | Tokens DTCG e pipeline         |
| `packages/ui`        | `@sette/ui`                 | Componentes React (publicável) |
| `packages/icons`     | `@design-system/icons`      | Ícones                         |
| `apps/storybook`     | `@design-system/storybook`  | Documentação                   |
| `apps/playground`    | `@design-system/playground` | App de validação               |
| `scripts/figma-sync` | `@design-system/figma-sync` | Sincronização com o Figma      |

## Começando

```bash
nvm use            # Node 22
corepack enable    # pnpm 10
pnpm install
pnpm lint && pnpm typecheck
```

O README completo (instalação, tokens, theming, a11y, publicação, roadmap) será expandido
conforme as etapas avançam.
