# @design-system/tokens

Fonte de verdade visual do Design System. Tokens em formato **DTCG** → **Style Dictionary v5** →
`tokens.css`, `tokens.json`, `tokens.ts` (+ `tokens.js`/`tokens.d.ts`).

```
src/
  primitive/   valores brutos (color, dimension, typography, effects)   — privados
  semantic/    color.light.json · color.dark.json (modos) · shared.json — API visual
  component/   button.json · input.json                                 — só quando necessário
build/         config · dtcg (loader) · validate · build · testes
```

## Regras (aplicadas por `pnpm validate`, parte do `build`)

1. **Primitive** é literal. **Semantic** só aponta para primitive. **Component** só aponta para semantic
   (ou `font.*`, escala tipográfica fundamental).
2. `color.light.json` e `color.dark.json` têm exatamente as mesmas chaves (paridade de temas).
3. Contraste WCAG 2.2 validado por tema: texto ≥ 4.5:1, bordas de controles/foco ≥ 3:1.

## Convenções

- Nome → variável: `color.action.primary` → `--ds-color-action-primary`.
- Um grupo que é token e tem variantes usa `$root`: `color.action.primary.$root` + `.hover` + `.active`.
  Referências a ele: `{color.action.primary.$root}`. O sufixo `$root` nunca aparece no nome CSS.
- Temas: `:root, [data-theme="light"]` e `[data-theme="dark"]`. Tokens de componente são re-declarados
  em `:root, [data-theme]` porque `var()` em custom properties resolve onde é declarado.
- `prefers-reduced-motion: reduce` zera `--ds-transition-duration-*`.

## Comandos

```bash
pnpm --filter @design-system/tokens build   # validate + Style Dictionary + tsc
pnpm --filter @design-system/tokens test
```

Adicionar um tema (Brand A): criar `semantic/color.brand-a.json`, registrá-lo em `build/config.ts` (`THEMES`).
