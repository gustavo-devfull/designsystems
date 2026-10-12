# @sette/ui

Componentes React acessíveis e tematizáveis, dirigidos por design tokens.

```tsx
import { Button, ThemeProvider } from "@sette/ui";
import "@sette/ui/styles.css";

<ThemeProvider storageKey="theme">
  <Button variant="primary" size="md" loading={false}>
    Save changes
  </Button>
</ThemeProvider>;
```

## Princípios

- **Semântica, não cor física.** Classes como `bg-action-primary`, `rounded-control`, `p-md` vêm dos tokens
  (`@design-system/tokens`). A paleta padrão do Tailwind não existe aqui.
- **Sem reset global.** `styles.css` não inclui preflight; a biblioteca não restiliza a aplicação.
- **React é peer dependency.** O build preserva módulos (`preserveModules`) para tree shaking real.

## Estrutura de um componente

`X.tsx` · `X.types.ts` · `X.variants.ts` (CVA) · `X.test.tsx` · `X.stories.tsx` · `index.ts`

## Testes

```bash
pnpm --filter @sette/ui test        # tudo
pnpm --filter @sette/ui test:a11y   # apenas verificações axe
```

`src/test/css-contract.test.tsx` compila `styles.css` com o Tailwind e falha se qualquer classe usada por um
componente não gerar CSS (typo, ou token não exposto ao Tailwind). jsdom não calcula contraste: ele é
garantido na camada de tokens (`validate`) e pelo addon de a11y do Storybook.
