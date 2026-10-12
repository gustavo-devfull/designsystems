# Contribuindo

Obrigado por ajudar! O fluxo é pequeno; as regras de verdade ficam em [`docs/governance.md`](docs/governance.md).

## Ambiente

```bash
nvm use            # Node 22
corepack enable    # pnpm 10
pnpm install
pnpm dev           # Storybook
```

## Fluxo de uma mudança

1. Branch a partir de `main`.
2. Faça a mudança seguindo a [governança](docs/governance.md) (tokens, componentes, API pública).
3. Rode localmente o que o CI roda:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   pnpm build && pnpm build-storybook
   pnpm a11y            # gate de acessibilidade em navegador real (precisa do Chromium do Playwright)
   ```

4. Se mudou código publicado (`@sette/ui`, ou tokens/ícones que ele distribui): `pnpm changeset`
   (patch / minor / major; veja [`docs/releasing.md`](docs/releasing.md)). Sem release: `pnpm changeset add --empty`.
5. Abra o PR. O CI executa lint → typecheck → testes → changeset → build → contrato do pacote → gate de acessibilidade.

## Padrões

- TypeScript `strict`, sem `any`. Sem cores/espaçamentos fixos; use tokens semânticos.
- Commits em inglês, no imperativo, com prefixo convencional (`feat:`, `fix:`, `docs:`, `chore:`…).
- Teste comportamento, não implementação. Todo componente novo tem teste de teclado/ARIA e `axe`.
- Não commite credenciais. O Figma usa variáveis de ambiente (`.env.example`).

## Reportando problemas de acessibilidade

Abra uma issue com o componente, o estado, a tecnologia assistiva/navegador e o critério WCAG afetado. Problemas de acessibilidade
têm prioridade sobre novas funcionalidades.
