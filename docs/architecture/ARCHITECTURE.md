# Arquitetura técnica

> Pipeline: Figma Variables → DTCG tokens → Style Dictionary → CSS Variables → Tailwind → React + TS → Storybook → A11y/Tests → CI → npm

## 1. Problema

Times de produto acumulam divergência entre design e código: cores hardcoded, temas duplicados,
componentes sem contrato de acessibilidade. O objetivo é uma **cadeia única e automatizável**
em que a mudança de uma variável no Figma se propague, de forma validada, até o pacote publicado.

## 2. Estrutura do monorepo

```
design-system/
├── packages/
│   ├── tokens/        @design-system/tokens  DTCG → Style Dictionary → css/json/ts
│   ├── ui/            @sette/ui              componentes React (pacote publicável)
│   └── icons/         @design-system/icons   ícones SVG tree-shakeable
├── apps/
│   ├── storybook/     documentação (Foundations / Components / Patterns)
│   └── playground/    app real (dashboard) que prova o consumo do pacote
├── scripts/
│   └── figma-sync/    Figma API → DTCG (fetch, convert, validate, build)
├── docs/              arquitetura, governança, case de engenharia
└── .github/workflows/ CI
```

Regra de dependência (unidirecional, sem ciclos):

```
figma-sync ──► tokens ──► ui ──► storybook
                          └────► playground
              icons ─────► ui
```

- `tokens` não conhece React nem Tailwind.
- `ui` consome apenas os **artefatos gerados** de `tokens` (CSS vars, preset Tailwind).
- `storybook` e `playground` consomem `@sette/ui` como consumidores externos (workspace protocol).

## 3. Arquitetura de tokens (3 camadas)

| Camada        | Exemplo                            | Aponta para | Muda por tema?  |
| ------------- | ---------------------------------- | ----------- | --------------- |
| **Primitive** | `color.blue.500`, `spacing.4`      | valor bruto | não             |
| **Semantic**  | `color.action.primary`             | primitive   | **sim** (modes) |
| **Component** | `button.background.primary` (raro) | semantic    | herda           |

- Formato **DTCG** (`$type`, `$value`, `$description`), referências `{color.blue.500}`.
- Prefixo CSS `--ds-`. Ex.: `--ds-color-action-primary`.
- Componentes e Tailwind **só** referenciam semantic/component tokens. Primitives são privados
  (lint de tokens no CI impede uso direto de primitives em `ui`).
- Criar component token apenas quando um componente precisa divergir do semantic sem afetar
  os demais; caso contrário reutilizar semantic.

### Outputs (Style Dictionary v5)

`tokens.css` (custom properties, um bloco por tema), `tokens.json`, `tokens.ts` (tipos + valores).

## 4. Estratégia de temas

- Primitives em `:root`. Semantic tokens redefinidos por `[data-theme="light"|"dark"]`.
- Cada tema é um **arquivo de modo** (`semantic/light.json`, `semantic/dark.json`) espelhando os
  _modes_ do Figma. Brand A/B = novo arquivo de modo, zero mudança em componentes.
- `ThemeProvider` define `data-theme` e respeita `prefers-color-scheme` por padrão.
- Componentes nunca duplicados por tema: só variáveis CSS mudam.

## 5. Tailwind

Tailwind **v4** (CSS-first): `@theme` mapeia utilitários para `var(--ds-*)`, gerado a partir do
pacote de tokens — Tailwind nunca é fonte de verdade. Resultado: `bg-action-primary`,
`text-text-primary`, `border-border-default`. A paleta padrão do Tailwind (`blue-500`…) é
desabilitada (`--color-*: initial`) para impedir cor física nos componentes.

## 6. API de componentes

`forwardRef` + `className` + props nativas do elemento; variantes via **CVA**; `tailwind-merge`
para resolver conflitos de classe. Props enumeradas (`variant`, `size`), nunca booleans de estilo
(`<Button blue rounded />` é proibido). Radix UI somente para Dialog, Tooltip, Tabs, Select e
Switch/Checkbox/Radio se o ganho de acessibilidade justificar.

Estrutura por componente: `X.tsx`, `X.types.ts`, `X.variants.ts`, `X.test.tsx`, `X.stories.tsx`,
`index.ts`.

## 7. Acessibilidade

WCAG 2.2 AA como baseline. Três linhas de defesa: `eslint-plugin-jsx-a11y` (estático),
`vitest-axe` (por componente, em CI), Storybook `addon-a11y` (visual/manual, com `test: 'error'`
para violações críticas). Testes de teclado dedicados para componentes compostos.
`prefers-reduced-motion` tratado globalmente nos tokens de motion.

## 8. Testes

Vitest + Testing Library + jsdom. Testar comportamento observável (roles, teclado, ARIA), não
implementação. Storybook stories reutilizadas como testes via `addon-vitest`.

## 9. Pacote e tree shaking

`@sette/ui`: ESM only, `sideEffects: ["**/*.css"]`, `exports` com `.`, `./styles.css`,
`./tokens.css`; `react`/`react-dom` como `peerDependencies` (nenhuma segunda cópia do React);
build em modo library (Vite) preservando módulos (`preserveModules`) para tree shaking real.
`@design-system/tokens` é embarcado no CSS de `@sette/ui` (devDependency), mas pode ser
publicado separadamente.

## 10. CI/CD

`install → lint → typecheck → test → a11y → build → build-storybook`. Preparado (não ativado)
para Chromatic, Changesets e publicação npm com provenance.

## 11. Dependências e justificativas

| Dependência                           | Por quê                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------- |
| pnpm workspaces + **catalog**         | Versões únicas centralizadas, instalação estrita, rápido                   |
| Style Dictionary v5                   | Padrão de mercado; suporte nativo a DTCG, transforms/formatos custom       |
| Tailwind v4                           | Config CSS-first encaixa direto em CSS variables, sem JS de config         |
| CVA + tailwind-merge + clsx           | Variantes tipadas e merge determinístico; evita prop explosion             |
| Radix UI (pontual)                    | Foco/ARIA/teclado de Dialog, Tooltip, Tabs, Select são difíceis de acertar |
| Vitest + Testing Library + vitest-axe | Mesmo toolchain do Vite; foco em comportamento + a11y automática           |
| Storybook 9 + addon-a11y/vitest       | Documentação viva + testes de interação/a11y sobre as mesmas stories       |
| typescript-eslint strictTypeChecked   | `any` proibido, segurança de tipos como contrato público                   |

## 12. Trade-offs

- **Monorepo vs. repos separados**: um PR atravessa token → componente → doc; custo é CI maior
  (mitigável com filtros `--filter`/cache).
- **Tailwind como camada de consumo, não de definição**: perde a ergonomia de `theme.extend`
  manual, ganha uma única fonte de verdade ligada ao Figma.
- **Radix pontual vs. 100% próprio**: reimplementar focus-trap/typeahead aumenta risco de a11y;
  Radix isolado em poucos componentes mantém o controle da API pública.
- **Tailwind classes no bundle**: o consumidor importa `styles.css` pré-compilado; não exige
  Tailwind no app consumidor.

## 13. Próximos passos (ordem de execução)

6. `packages/tokens` (DTCG + Style Dictionary) → 7. Tailwind → 8. `packages/ui` (Button de referência)
   → 9. Storybook → 10–15. demais componentes, testes, a11y, CI, publicação, docs.
