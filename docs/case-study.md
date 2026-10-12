# Case de engenharia: um design system ponta a ponta

> _"I built an end-to-end design system pipeline connecting Figma Variables to design tokens, Tailwind and reusable React components. The system includes semantic theming, Storybook documentation, accessibility testing, automated quality checks and a publishable package."_

Este documento explica **por que** o sistema é assim, o que foi trocado por quê, e o que os testes encontraram pelo caminho.
Os números são medidos no repositório; o que **não** foi provado está listado em [Limites](#limites-honestos).

## 1. Problema

Times de produto acumulam divergência entre design e código: a mesma cor existe em três tons, o modo escuro é uma cópia dos
componentes, "acessível" significa "alguém testou uma vez". Cada correção manual é uma chance de nova divergência.

O objetivo: **uma cadeia única e automatizável**, em que uma variável no Figma chegue, validada, ao pacote que o produto instala, e
em que **a acessibilidade seja um portão de CI**, não uma intenção.

## 2. Arquitetura

```
Figma Variables → DTCG → Style Dictionary → CSS Variables → Tailwind (@theme inline) → React + CVA → Storybook
                    ▲ validate (camadas · paridade · contraste)                                   → gate a11y → npm
```

Monorepo pnpm (`tokens`, `ui`, `icons`, `storybook`, `playground`, `a11y`, `figma-sync`) com dependências unidirecionais.
`tokens` não conhece React; `ui` consome só artefatos gerados; Storybook e playground consomem `ui` como um cliente externo.
O playground usa o **`dist`**, não o código-fonte: se o pacote publicável quebra, o app de exemplo quebra primeiro.

## 3. Decisões e trade-offs

| Decisão                                                                    | Por quê                                                                                     | Custo / trade-off                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Tokens em 3 camadas** (primitive → semantic → component), DTCG           | Papéis visuais estáveis; trocar de tema ou de marca é remapear semantic → primitive         | Mais indireção; exige disciplina (o validador a impõe)                             |
| **Tailwind consome, não define** (`@theme inline`)                         | Uma fonte de verdade (Figma/tokens); sem `bg-blue-500` por engano                           | Perde o `theme.extend` manual; depende do Tailwind v4 (CSS-first)                  |
| **Paleta padrão do Tailwind removida**                                     | Impede cor física nos componentes; um teste de contrato falha se uma classe não gerar regra | Sem breakpoints/animações padrão: tiveram de virar tokens                          |
| **Elementos nativos estilizados** (Input, Select, Checkbox, Radio, Switch) | Teclado, leitores de tela e picker mobile corretos de graça                                 | Menos liberdade visual (um Select nativo não tem itens ricos)                      |
| **Radix só em Dialog, Tooltip, Tabs**                                      | Foco preso, roving tabindex e posicionamento são difíceis de acertar                        | +3 dependências; a API pública continua nossa                                      |
| **`label` e `aria-label` obrigatórios por tipo**                           | O erro de acessibilidade mais comum vira erro de compilação                                 | Menos ergonomia em protótipos                                                      |
| **`tailwind-merge` em todo componente**                                    | `className` do consumidor resolve conflitos de forma previsível                             | ~28 KB minificados (o resto de um `Badge` tem ~1 KB); medido e documentado         |
| **Sem reset global na biblioteca**                                         | Uma biblioteca não deve restilizar a aplicação                                              | Cada elemento nativo zera o que precisa (já gerou 2 bugs, veja §9)                 |
| **ESM only**, tree-shaking por módulo                                      | Bundle menor; padrão atual                                                                  | CommonJS usa `import()`                                                            |
| **Figma como fonte só do que ele sabe expressar**                          | Variáveis cobrem cor/número; sombra e tipografia composta não                               | Dois donos de tokens (regra explícita de propriedade; o sync preserva o do código) |

## 4. Arquitetura de tokens

- **Primitive**: valor bruto, privado. **Semantic**: papel (`color.action.primary`), muda por tema. **Component**: só quando o
  componente precisa divergir (`button.border.outline`).
- 223 tokens por tema (109 / 68 / 46). Nome → variável: `color.action.primary` → `--ds-color-action-primary`.
- **Validador no build** (reprova): camada errada referenciada, literal fora de primitive, chaves diferentes entre light e dark,
  contraste abaixo de WCAG (texto 4.5:1; bordas de controle e foco 3:1), em **68 verificações por rodada**.
- Detalhe que importa: `var()` em uma custom property resolve **onde é declarada**. Tokens de componente declarados só em `:root`
  ficariam presos ao tema da raiz; por isso são redeclarados em `:root, [data-theme]` e o Tailwind usa `@theme inline`. Há teste para isso.

## 5. Estratégia de temas

Light e dark são **modos** dos tokens semantic (`[data-theme]`); nenhum componente conhece temas. Nova marca = novo arquivo de modo.
`ThemeProvider` segue o sistema, persiste a escolha e permite escopo em um elemento: overlays (Dialog, Tooltip) usam o elemento
do tema como container de portal, para que um painel escuro dentro de uma página clara continue escuro.

## 6. Estratégia de API de componentes

`forwardRef` + `className` + props nativas; variantes por **enum** via CVA (`variant="primary" size="md"`), nunca `blue rounded`;
composição (`Card` → `CardHeader`/`CardTitle`…); estados persistentes como props (`disabled`, `loading`), estados de interação no CSS.
`loading` mantém dimensões (o texto fica no DOM com opacidade 0) e o botão focável. Campos compartilham `Field` (label, ajuda, erro,
`aria-describedby`, `useId`, região `aria-live` sempre montada para que erros tardios sejam anunciados).

## 7. Estratégia de acessibilidade

Quatro camadas, cada uma pegando o que a anterior não vê:

1. **Estática**: `eslint-plugin-jsx-a11y`.
2. **Unidade** (`vitest-axe`, jsdom): papéis, rótulos, ARIA, teclado. jsdom não tem layout, então **contraste fica desligado ali**.
3. **Tokens**: contraste medido por par e por tema, no build.
4. **Gate em navegador real**: Playwright + axe-core (WCAG 2.2 AA + best practices, **contraste real**) em todas as stories e páginas de
   docs, em light e dark, executando as `play` functions, mais 8 cenários do app (abas, erros de validação, diálogos abertos, tooltip).
   316 renderizações por execução (~80 s no runner do GitHub). Reprova em `serious`/`critical` ou story quebrada. Tem **autoteste**: uma
   fixture com violações conhecidas precisa ser detectada, ou a execução aborta ("o gate está cego").

## 8. Estratégia de testes

Comportamento, não implementação (238 testes automatizados): papéis e nomes acessíveis, teclado (setas, Home/End, Esc, Tab),
foco (preso e devolvido), ARIA (`aria-describedby`, `aria-invalid`), estados. Além disso:

- **Contrato de CSS**: renderiza todos os componentes em todos os estados, coleta as classes reais do DOM e compila com o Tailwind;
  reprova qualquer classe que não gere regra.
- **Ida e volta com o Figma**: tokens → formato Figma → tokens reproduz exatamente os arquivos sincronizados.
- **Consumidor real**: empacota o pacote, instala num projeto vazio e verifica SSR, exports, uma única cópia do React,
  tree-shaking e tipos sob `nodenext`.
- As verificações principais (validador de tokens, contrato de CSS, harness do axe, o gate e os tipos do consumidor) foram **provadas
  capazes de falhar** injetando um defeito antes de serem confiadas; nem toda verificação menor passou por esse teste.

## 9. O que o pipeline pegou (evidência)

Defeitos reais encontrados por testes, não por revisão:

| Defeito                                                                                                    | Quem achou                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Spinner não girava: sem o tema padrão do Tailwind, `animate-spin` não gerava CSS                           | teste de contrato de CSS            |
| Botões com borda/fonte do navegador (sem reset global)                                                     | screenshot em navegador real        |
| Tabs: texto claro sobre o fundo cinza do `<button>` no tema dark (contraste de 1,1:1 medido pelo axe)      | gate de acessibilidade              |
| Ícones com um `\n` literal virando texto dentro do SVG (`label-content-name-mismatch`)                     | gate de acessibilidade              |
| `DialogContent` com `<header>` criando um segundo landmark `banner`                                        | axe sobre o playground              |
| Foco no 1º campo inválido ocorria antes de `aria-invalid` ser renderizado                                  | testes do playground                |
| `.d.ts` com imports relativos sem extensão: tipos não resolviam sob `nodenext`                             | `attw` + teste de consumidor        |
| `npm pack` deixa `catalog:` no `package.json` (pacote não instalável); o release usa `pnpm`                | teste de consumidor                 |
| `lint` com tipos falhava num clone limpo (faltavam os tipos dos pacotes construídos)                       | simulação de CI do zero             |
| Breakpoints (`md:`) inexistentes sem o tema padrão                                                         | construção do playground responsivo |
| O próprio gate esperava a fase `completed` (a real é `finished`) e lia um template de erro sempre presente | execução de verificação do gate     |

## 10. Arquitetura do pacote

`@sette/ui`: ESM; `exports` para `.`, `./styles.css`, `./tokens.css`, `./tailwind.css`; `react`/`react-dom` como `peerDependencies`;
`sideEffects: ["**/*.css"]`; módulos preservados (`preserveModules`); `"use client"` só nos módulos `.tsx` (helpers como `cn` e as
variantes continuam chamáveis em Server Components); tipos com extensões explícitas. Tokens e ícones são embarcados no CSS/JS do
pacote (por isso são `private` por enquanto). Contrato verificado a cada PR: `publint --strict`, `attw`, e o teste de consumidor
com orçamento de tamanho (um `Badge` isolado: ~30 KB, dos quais ~28 KB são `tailwind-merge`; a biblioteca inteira: ~145 KB).

## 11. Estratégia de CI

`check` (build dos pacotes → lint → typecheck → testes → changeset presente) → `build` (pacotes, playground, Storybook, contrato do
pacote, teste de consumidor) → `a11y` (gate no navegador, com os artefatos já construídos) → `CI success` (um único status
obrigatório). Release (Changesets + provenance), Chromatic e o sync do Figma estão **prontos e inativos**, atrás de variáveis de repositório.
A primeira execução real no GitHub encontrou dois problemas que a máquina local escondia (erros de lint nos arquivos novos do gate e um
erro de tipos num teste novo, porque eu só havia rodado parte das verificações): foram corrigidos até o pipeline ficar verde.

## 12. Impacto esperado

São **expectativas** de engenharia, não métricas medidas:

- **Menos divergência design ↔ código**: um nome, um valor, uma origem; mudança de marca ou tema vira edição de dados.
- **Acessibilidade como regressão detectável**: uma violação nova reprova o PR em vez de ser descoberta em produção.
- **Menos custo de adoção**: instalar, importar, usar; tipos que impedem os erros mais comuns (campo sem rótulo).
- **Revisão mais barata**: o que a máquina verifica (camadas, contraste, API do pacote) sai da pauta de revisão.

Para medir de verdade seriam necessários dados de uso (tempo de adoção, defeitos de acessibilidade em produção, taxa de divergência).

## Limites honestos

- O **sync com o Figma nunca falou com a API real** (exige plano Enterprise e um token com `file_variables:read`); foi validado contra o
  formato documentado e por um teste de ida e volta. O primeiro uso real pode revelar diferenças.
- Não existe ainda um **arquivo Figma real** com essas variáveis; o contrato está descrito e há um fixture.
- O pacote **não foi publicado** (falta o escopo `@sette` no npm e um token); o workflow está pronto e inativo.
- **Regressão visual** (Chromatic) está preparada, não ativa; hoje a verificação visual de screenshots foi manual.
- Contraste de **estados de interação** (hover/focus) vale pelo que os stories mostram; o gate não varre todas as combinações possíveis.
- O gate **não substitui** teste manual com leitores de tela e usuários reais.

## Como contar isso em uma entrevista

> "Construí um pipeline de design system de ponta a ponta: das variáveis do Figma a tokens DTCG validados, Tailwind e componentes React
> reutilizáveis. O sistema tem temas semânticos, documentação no Storybook, testes de acessibilidade, verificações automáticas de
> qualidade e um pacote publicável."

Perguntas prováveis e onde está a resposta:

- _Por que três camadas de tokens?_ §3–4. _Como o dark mode funciona sem duplicar componentes?_ §5. _Por que Radix só em três componentes?_ §3.
- _Como você garante acessibilidade?_ §7 — e a prova de que o gate pode falhar (autoteste). _O que ele já pegou?_ §9.
- _O que dá errado ao publicar uma biblioteca?_ §10 — `catalog:` no `npm pack`, `.d.ts` sem extensão, React duplicado, side effects.
- _O que você não terminou?_ [Limites](#limites-honestos) — dizer isso primeiro costuma pesar a favor.
