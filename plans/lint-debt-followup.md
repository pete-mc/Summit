# Lint Debt Follow-up (Post ESLint v9 Migration)

## Context

Repository lint is operational under ESLint v9 flat config, but existing debt remains and should be handled in dedicated cleanup PRs.

## Current snapshot

- Errors: 474
- Warnings: 9

Top rule categories observed:

- `prettier/prettier`: 395
- `@typescript-eslint/no-explicit-any`: 69
- `camelcase`: 4
- `@typescript-eslint/no-unused-vars`: 2
- `@typescript-eslint/no-require-imports`: 2
- `@typescript-eslint/no-unused-expressions`: 1
- `@typescript-eslint/no-empty-object-type`: 1

## Recommended cleanup sequence

1. **Prettier pass first**
   - Run autofix-only formatting updates in small batches.
2. **Type-any triage in tests**
   - Replace obvious `any` usages in test scaffolding with narrow helper types.
3. **Residual rule cleanup**
   - Resolve `camelcase`/unused expressions/unused vars with minimal behavior changes.
4. **Safety checks on each cleanup PR**
   - `npm run lint`
   - `npm test`
   - `npm run build-prod`

## Acceptance criteria

- `npm run lint` exits 0
- Tests and production build remain green
