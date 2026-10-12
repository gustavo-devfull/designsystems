# Changesets

Every pull request that changes a published package (`@sette/ui`) adds a changeset: `pnpm changeset`.
It records **what changed** and **how big** (patch / minor / major) so versions and the changelog are generated, not guessed.
See [`docs/releasing.md`](../docs/releasing.md) for the rules (what counts as breaking) and the release flow.
