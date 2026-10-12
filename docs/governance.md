# Governança

Como o sistema evolui sem perder consistência. Cada regra aqui é **verificada por uma máquina** quando possível (validador de
tokens, ESLint, testes, gate de acessibilidade, CI); o resto é checklist de revisão.

## Princípios

1. **Semântica antes de aparência.** Componentes dependem de _papéis_ (`action.primary`), nunca de cores físicas (`blue.600`).
2. **Uma fonte de verdade por coisa.** Cores/escalas: tokens (Figma → DTCG). Comportamento: componente. Documentação: stories.
3. **Acessibilidade não é opcional.** Um componente sem teste de teclado/ARIA e sem passar no gate não entra.
4. **API pequena e previsível.** Enumerações em vez de booleanos de estilo; composição em vez de props em excesso.

## Como criar um token

1. **Escolha a camada** (veja _Quando criar um component token_ abaixo).
   - Valor bruto novo → **primitive** em `packages/tokens/src/primitive/*.json`.
   - Papel visual novo → **semantic** nos **dois** modos: `semantic/color.light.json` **e** `color.dark.json` (mesmas chaves;
     o validador reprova paridade quebrada). Não-cor (spacing, radius, size, breakpoint) vai em `semantic/shared.json`.
   - Específico de um componente → **component** em `component/<nome>.json`.
2. Use **referências**, não literais, fora da camada primitive: `{ "$type": "color", "$value": "{color.blue.600}" }`. Grupo que é
   token e tem variantes usa `$root` (`color.action.primary.$root` + `.hover`).
3. Adicione `$description` quando o papel não for óbvio.
4. `pnpm tokens:build`. O validador checa camadas, paridade e **contraste** (se criou um par texto/fundo, inclua-o em
   `packages/tokens/build/validate.ts` para que ele seja medido nos dois temas).
5. Um **novo grupo** (ex.: `z-index`) precisa também de uma regra em `packages/tokens/build/tailwind.ts` para virar utilitário, e (se for
   um nome de escala) de uma entrada em `tokenScales` em `packages/ui/src/lib/cn.ts` (há um teste que acusa a divergência).
6. Se o Figma é dono do grupo, crie a variável lá com o nome do contrato (`scripts/figma-sync/README.md`); o teste de ida e volta
   reprova se o repositório e o formato Figma divergirem.
7. Changeset: **minor** (token novo) e inclua `@sette/ui` (ele distribui o CSS dos tokens).

## Como modificar um token

| Mudança                                              | Impacto       | O que fazer                                                                              |
| ---------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| Ajustar o **valor** dentro do papel (um tom de azul) | minor         | Altere o primitive; o validador garante contraste; changeset explica o efeito visual     |
| Apontar um semantic para outro primitive             | minor/major\* | \*major se o resultado visual for uma regressão para a maioria dos consumidores          |
| **Renomear** ou **remover** um token                 | **major**     | Mantenha o antigo como alias por uma versão minor (depreciação), remova no próximo major |
| Mudar o **significado** de um papel                  | **major**     | Crie um token novo; deprecie o antigo                                                    |

Nunca edite `dist/`. Se o Figma é dono do token, mude no Figma e rode `pnpm figma:sync` (uma edição manual seria revertida e
`figma:check` acusaria a divergência).

## Quando criar um component token, quando reutilizar um semantic

**Reutilize o semantic** (padrão) quando o componente usa o papel como ele é: um `Badge` usa `feedback.success.*`; `Checkbox`,
`Radio` e `Switch` usam `border.input` e `action.primary`. Criar um token por componente "só por simetria" duplica decisões.

**Crie um component token** apenas quando **todas** forem verdadeiras:

- o componente precisa de um valor que **diverge** do papel semântico em algum estado (ex.: `button.border.outline` usa `border.strong`);
- essa divergência deve poder mudar **sem** afetar os outros componentes que usam o semantic;
- ou o componente tem muitas variantes × estados que merecem um vocabulário próprio (`button.background.primary.hover`).

Component tokens **só** apontam para semantic (o validador reprova um primitive).

## Como adicionar um componente

Estrutura em `packages/ui/src/components/<Nome>/`: `<Nome>.tsx`, `<Nome>.types.ts`, `<Nome>.variants.ts` (CVA, quando houver
variantes), `<Nome>.test.tsx`, `<Nome>.stories.tsx`, `index.ts`. Checklist:

- [ ] **API**: `forwardRef`, `className` (resolvido com `cn`), props nativas do elemento, HTML semântico, variantes por enum. Nada de
      `blue`/`rounded`. Campos de formulário reutilizam `Field` (label obrigatória, ajuda, erro, `aria-describedby`, `useId`).
- [ ] **Estilos só com tokens**: utilitários semânticos (`bg-action-primary`, `p-md`). O teste de contrato de CSS reprova uma
      classe que não gere regra; adicione o componente à galeria de `src/test/css-contract.test.tsx` (inclusive estados e tamanhos).
- [ ] Sem reset global na biblioteca: zere o que depende do navegador (`border`, `background`, `font`) em elementos nativos
      (já pegamos isso em Button, Tabs).
- [ ] **Testes de comportamento**: renderização, interação, `disabled`/`loading`/erro, `ref`, `className`; teclado e foco nos
      compostos; um teste `a11y: …` com `axe` por estado relevante.
- [ ] **Radix** só se o padrão ARIA for difícil de acertar (foco preso, roving tabindex, posicionamento). Justifique na PR.
- [ ] **Stories**: Default, variantes, tamanhos, `disabled`, `loading`/erro (se houver), `LongContent`, `DarkTheme`, casos-limite, e
      `play` functions para os fluxos de teclado.
- [ ] **Documentação**: `apps/storybook/src/components/<Nome>.mdx` com Overview, Usage, API, Variants/Sizes/States, Accessibility,
      Do/Don't e Design tokens utilizados; relação com o Figma em _Design ↔ Code_.
- [ ] Exporte em `packages/ui/src/index.ts` (**exports nomeados**, sem efeitos colaterais, para o tree-shaking).
- [ ] `pnpm changeset` (**minor**). CI verde, incluindo o gate de acessibilidade.

## Como alterar a API pública

API pública = o que `@sette/ui` exporta, as props e seus tipos, os papéis/ARIA/teclado, as variáveis `--ds-*`, os utilitários
Tailwind e as entradas de `exports` do pacote.

1. Prefira **adicionar** a mudar. Prop nova opcional, variante nova, componente novo: minor.
2. Para **mudar** algo existente, mantenha o comportamento antigo funcionando e marque-o como depreciado (abaixo); remova só em um major.
3. Todo aumento de rigor em tipos (aceitar menos) é breaking; todo alargamento é compatível.
4. Atualize os stories, a página de docs e o `Design ↔ Code`. Os testes do consumidor (`test:package`) devem continuar compilando
   o uso documentado.
5. O changeset descreve o efeito para quem **usa** o pacote, não o diff.

## Como lidar com breaking changes

A tabela do que é breaking está em [`releasing.md`](./releasing.md). Procedimento:

1. Confirme que **não há** caminho compatível (alias, prop antiga mantida, valor padrão preservado).
2. Se não houver, **major** no changeset, com um trecho _"Migração"_ (antes/depois em código).
3. Se possível, entregue antes uma versão **minor** com o aviso de depreciação (em desenvolvimento, `console.warn` uma vez).
4. Agrupe breaking changes relacionados em um único major; não solte majors por conveniência.

## Como depreciar um componente, prop ou token

1. **Minor**: continue funcionando; marque com `@deprecated` (JSDoc) apontando o substituto; avise na página de docs (callout) e
   no changeset; em dev, `console.warn` uma única vez.
2. **Mantenha por pelo menos um ciclo minor** (ou o prazo que o time combinar).
3. **Major**: remova código, tokens, stories, docs e o item do _Design ↔ Code_; changeset com migração.

Tokens depreciados permanecem como alias do substituto (mesmo valor), nunca com um valor próprio.

## Definição de pronto

CI verde (lint, typecheck, testes, build, contrato do pacote, gate de acessibilidade); changeset presente (ou `--empty` justificado);
docs e stories atualizados; nenhuma cor/espaçamento fixo no componente; revisão por uma pessoa de design **ou** de engenharia que
confirme a relação com o Figma.
