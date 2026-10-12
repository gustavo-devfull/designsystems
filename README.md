# Sette Design System

Design system ponta a ponta: **Figma Variables → Design Tokens → Style Dictionary → CSS Variables → Tailwind → React + TypeScript → Storybook → Acessibilidade → Testes → CI/CD → pacote npm**.

Um monorepo que mostra o fluxo inteiro funcionando: cores e espaçamentos nascem como variáveis, viram tokens validados, viram CSS e utilitários Tailwind, alimentam componentes React acessíveis, são documentados no Storybook, verificados em um navegador real a cada pull request e publicados como um pacote.

> Case de engenharia (problema, decisões, trade-offs, o que o CI já pegou): [`docs/case-study.md`](docs/case-study.md).

## Sumário

[Overview](#overview) · [Arquitetura](#arquitetura) · [Primeiros passos](#primeiros-passos) · [Instalação e uso](#instalação-e-uso) · [Tokens](#tokens) · [Theming](#theming) · [Componentes](#componentes) · [Storybook](#storybook) · [Acessibilidade](#acessibilidade) · [Testes](#testes) · [Desenvolvimento](#desenvolvimento) · [Build](#build) · [Publicação](#publicação-do-pacote) · [Integração com o Figma](#integração-com-o-figma) · [Contribuindo](#contribuindo) · [Roadmap](#roadmap)

## Overview

| Pacote / app         | Nome                        | Papel                                                                         |
| -------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `packages/tokens`    | `@design-system/tokens`     | Tokens DTCG (primitive → semantic → component), Style Dictionary, validação   |
| `packages/ui`        | **`@sette/ui`**             | Biblioteca React (17 componentes + `ThemeProvider`). **O pacote publicável.** |
| `packages/icons`     | `@design-system/icons`      | Ícones SVG tree-shakeable                                                     |
| `apps/storybook`     | `@design-system/storybook`  | Documentação: Foundations, Components, Patterns                               |
| `apps/playground`    | `@design-system/playground` | Dashboard real que consome o `dist` do `@sette/ui` (prova de integração)      |
| `scripts/a11y`       | `@design-system/a11y`       | Gate de acessibilidade em navegador real (Playwright + axe-core)              |
| `scripts/figma-sync` | `@design-system/figma-sync` | Camada de sincronização Figma Variables → DTCG                                |

Números atuais: **223 tokens por tema** (109 primitive, 68 semantic, 46 component), light e dark, **238 testes automatizados** e **316 renderizações** verificadas pelo gate de acessibilidade a cada PR (stories e páginas de docs em light/dark, mais 8 cenários do playground).

## Arquitetura

```
Figma Variables ──► figma-sync ──► DTCG (packages/tokens/src) ──► Style Dictionary ──► tokens.css · tokens.json · tokens.ts
                                         │ validate: camadas, paridade de temas, contraste WCAG        │
                                         ▼                                                              ▼
                                  tailwind.css (@theme inline) ────────────────────────────► @sette/ui (React + CVA) ──► styles.css
                                                                                               │                  │
                                                                              Storybook ◄──────┤                  ▼
                                                                              Playground ◄─────┘            npm: @sette/ui
```

Regras de dependência (sem ciclos): `tokens` não conhece React nem Tailwind; `ui` consome apenas os artefatos gerados; Storybook e playground consomem o `ui` como um consumidor externo.

Documentação de arquitetura: [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) · CI: [`docs/ci.md`](docs/ci.md) · Release: [`docs/releasing.md`](docs/releasing.md) · Governança: [`docs/governance.md`](docs/governance.md).

## Primeiros passos

Requisitos: Node 22 (`.nvmrc`) e pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm dev          # Storybook em http://localhost:6006 (constrói os tokens antes)
pnpm playground   # o app de exemplo
```

A partir de um clone limpo, `pnpm lint`, `pnpm typecheck` e `pnpm test` funcionam sozinhos: eles constroem os pacotes de que precisam (ganchos `pre*`).

## Instalação e uso

```bash
pnpm add @sette/ui      # ou: npm install @sette/ui
```

```tsx
import { Button, Input, Card, CardContent, ThemeProvider } from "@sette/ui";
import "@sette/ui/styles.css";
```

`react` e `react-dom` são _peer dependencies_: o pacote não traz outra cópia do React. ESM, tree-shakeable, funciona em SSR e em React Server Components (módulos de componente têm `"use client"`). Detalhes de estilos (apps com Tailwind próprio, só variáveis CSS) em [`packages/ui/README.md`](packages/ui/README.md).

> O pacote ainda **não foi publicado** no npm: o workflow de release está pronto e inativo (veja [Publicação](#publicação-do-pacote)).

## Tokens

Três camadas, em formato **DTCG** (`$type`, `$value`, `$description`):

| Camada        | Exemplo                       | Regra                                                         |
| ------------- | ----------------------------- | ------------------------------------------------------------- |
| **Primitive** | `color.blue.600`, `spacing.4` | Valor bruto; privado (nenhum componente os referencia)        |
| **Semantic**  | `color.action.primary`        | Aponta para primitive; é o que muda por tema                  |
| **Component** | `button.background.primary`   | Aponta para semantic; só quando o componente precisa divergir |

`pnpm tokens:build` gera `dist/tokens.css` (`--ds-color-action-primary: var(--ds-color-blue-600)`), `tokens.json`, `tokens.ts` e `tailwind.css`. O **validador** reprova o build se uma camada referenciar a errada, se light e dark divergirem em chaves ou se um par de cores não cumprir o contraste WCAG 2.2 (texto 4.5:1, bordas e foco 3:1). Detalhes: [`packages/tokens/README.md`](packages/tokens/README.md).

## Theming

Light e dark são _modos_ dos tokens semantic (`[data-theme="light" | "dark"]`); componentes nunca duplicam estilos por tema. `ThemeProvider` segue o sistema por padrão, persiste a escolha e aceita escopo no documento ou em um elemento (overlays como Dialog continuam dentro do tema). Adicionar uma marca (Brand A) é criar um arquivo de modo e registrá-lo; nenhum componente muda (guia na página _Themes_ do Storybook).

O Tailwind v4 **consome** os tokens, não os define: `@theme inline` mapeia `bg-action-primary`, `text-text-primary`, `rounded-control`, `p-md`… A paleta padrão foi removida: `bg-blue-500` não gera CSS.

## Componentes

Button · IconButton · Input · Textarea · Select · Checkbox · Radio/RadioGroup · Switch · Badge · Alert · Card · Avatar · Divider · Spinner · Dialog · Tooltip · Tabs.

Princípios de API: `forwardRef`, `className`, HTML semântico, variantes por enum (`variant`, `size`; nunca `blue rounded`), CVA + `tailwind-merge`, **`label` obrigatório** em todo campo e **`aria-label` obrigatório** no `IconButton` (verificado pelo TypeScript). Radix UI apenas onde a acessibilidade é difícil de acertar: Dialog, Tooltip e Tabs.

## Storybook

`pnpm dev`. Categorias: **Foundations** (Introduction, Design ↔ Code, Colors, Typography, Spacing, Radius, Shadows, Tokens, Themes, Icons — geradas de `tokens.json`), **Components** (uso, API, variantes, estados, acessibilidade, Do/Don't, tokens utilizados, `play` functions de teclado) e **Patterns** (formulário de cadastro com validação). Seletor de tema na barra de ferramentas.

## Acessibilidade

WCAG 2.2 AA como linha de base, em quatro camadas: `eslint-plugin-jsx-a11y` (estático) → `vitest-axe` por componente (unidade) → contraste validado nos tokens → **gate em navegador real** (todas as stories e páginas de docs em light e dark, `play` functions executadas, axe-core com contraste real). O gate reprova o CI em violação `serious`/`critical` ou story quebrada, e tem um **autoteste** que prova que ele consegue falhar. Estratégia completa: [`docs/ci.md`](docs/ci.md).

## Testes

```bash
pnpm test          # tudo (Vitest, Testing Library, node:test)
pnpm a11y:unit     # só as verificações axe em jsdom
pnpm a11y          # build + gate em navegador real (Chromium via Playwright)
```

Testa-se **comportamento** (papéis, teclado, ARIA, foco), não implementação. Destaques: teste de contrato de CSS (toda classe usada por um componente precisa gerar uma regra do Tailwind), teste de ida e volta dos tokens com o Figma, e um teste de consumidor que instala o pacote empacotado num projeto vazio.

## Desenvolvimento

| Comando                     | O que faz                                          |
| --------------------------- | -------------------------------------------------- |
| `pnpm dev`                  | Storybook com HMR (usa o código-fonte dos pacotes) |
| `pnpm lint` / `pnpm format` | ESLint (type-aware, `any` proibido) + Prettier     |
| `pnpm typecheck`            | `tsc` em todos os pacotes (TypeScript strict)      |
| `pnpm tokens:build`         | Valida e gera os tokens                            |
| `pnpm changeset`            | Registra uma mudança para o próximo release        |
| `pnpm clean`                | Remove `dist`/`coverage`                           |

## Build

```bash
pnpm build             # tokens → icons → ui (Vite library + tipos + styles.css) → playground
pnpm build-storybook   # Storybook estático
pnpm check:package     # publint + are-the-types-wrong
pnpm --filter @sette/ui test:package   # instala o tarball num projeto vazio e testa
```

## Publicação do pacote

Changesets + `pnpm publish` com _provenance_, via `.github/workflows/release.yml` (**inativo** até configurar `NPM_TOKEN` e `RELEASE_ENABLED`). A política de versionamento (o que é breaking), o fluxo e a depreciação estão em [`docs/releasing.md`](docs/releasing.md). O escopo `@sette` precisa pertencer a você no npm (ou o pacote deve ser renomeado).

## Integração com o Figma

`scripts/figma-sync` busca as Variables, converte para DTCG, valida e regenera. O Figma é a fonte da verdade de cores, espaçamentos, raios, breakpoints e component tokens; sombras, tipografia e movimento ficam no código. Funciona offline com um _fixture_ e é coberto por um teste de ida e volta. **Não foi exercitado contra a API real** (exige plano Enterprise). Contrato de configuração do arquivo Figma e uso: [`scripts/figma-sync/README.md`](scripts/figma-sync/README.md). Credenciais só por variável de ambiente (`.env.example`).

## Contribuindo

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) e [`docs/governance.md`](docs/governance.md) (como criar/alterar tokens, adicionar componentes, mudar a API pública, lidar com breaking changes e depreciar).

## Roadmap

- [x] **Fase 1** — monorepo, tokens, Tailwind, Button, Input, Card, Storybook
- [x] **Fase 2** — formulários, Dialog, Tooltip, Tabs, acessibilidade, testes
- [x] **Fase 3** — temas, integração com o Figma (camada pronta), CI, empacotamento (workflows de release prontos, inativos)
- [ ] **Fase 3 (pendências)** — exercitar o sync contra um arquivo Figma real; publicar `@sette/ui` (escopo npm + token)
- [ ] **Fase 4** — regressão visual (Chromatic, workflow pronto e inativo), site de documentação, componentes avançados (Combobox, Table, Popover, Toast), publicar `@design-system/tokens`

## Licença

MIT.
