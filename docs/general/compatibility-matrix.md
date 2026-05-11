# Compatibility Matrix (Phase 1 Baseline)

Last updated: 2026-04-23

## Runtime and Tooling Targets

| Area | Project target | Observed during Phase 1 run | Notes |
| --- | --- | --- | --- |
| Node.js | `24.x` (`package.json` engines + `.nvmrc`) | `v22.21.1` (local terminal) | Local runs succeeded, but npm emitted `EBADENGINE`; CI should continue using Node 24 to match policy. |
| npm | (not pinned) | `10.9.4` | Compatible with current lockfile and scripts. |
| TypeScript | `^5.9.3` | 5.9.3 resolved | Stable in current test/build flow. |
| ESLint | `^9.39.x` | 9.39.x resolved | Flat config is active and lint passes. |
| Jest | `29.7.0` + `jest-environment-jsdom` `29.7.0` | 29.7.0 line resolved | Passing, but major bump is needed for one remaining audit path. |
| Vue runtime | `2.7.16` | 2.7.16 resolved | Vue 2 is EOL; migration path is tracked separately. |
| Webpack | `^5.106.x` | 5.106.x resolved | Build passes and extension output contracts remain stable. |

## Baseline Validation Snapshot

Phase 1 reproducibility checks (from a clean install) succeeded:

- `npm ci` ✅
- `npm run lint` ✅
- `npm test` ✅ (21 suites / 57 tests)
- `npm run build-prod` ✅

Security baseline after prior safe remediations:

- `npm audit --audit-level=moderate` reports **16 vulnerabilities**
- Remaining findings require major-version upgrades (`npm audit fix --force` paths)

## Breaking Upgrade Tracks (from audit)

1. Jest/jsdom chain (`jest-environment-jsdom` / `jsdom` / `@tootallnate/once`)
2. Vue 2 ecosystem (`vue`, `vue-template-compiler`, `vue-loader` lineage)
3. Bundler plugin chain (`copy-webpack-plugin` / `css-minimizer-webpack-plugin` / `serialize-javascript`)
4. Dev server chain (`webpack-dev-server` / `sockjs` / `uuid`)

These tracks are sequenced in the breaking security upgrades planning document.
