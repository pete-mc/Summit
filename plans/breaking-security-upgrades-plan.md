# Breaking Security Upgrades Plan (Post Safe Audit Fix)

## Context

After applying non-breaking `npm audit fix`, the repository remains healthy (`lint`, `test`, and `build-prod` are green), but **16 vulnerabilities** remain and require breaking upgrades.

These vulnerabilities are concentrated in a few upgrade tracks:

- **Vue 2 stack** (`vue`, `vue-template-compiler`, `vue-loader` transitive chain)
- **Dev server/tooling stack** (`webpack-dev-server` and `sockjs/uuid` chain)
- **Test environment stack** (`jest-environment-jsdom` and transitive `jsdom/http-proxy-agent` chain)
- **Bundler plugin chain** (`copy-webpack-plugin` / `css-minimizer-webpack-plugin` and transitive `serialize-javascript`)

## Current constraints

- Current app architecture relies on Vue 2-era dependencies.
- Jumping straight to `npm audit fix --force` would cross major boundaries with high regression risk.
- We need staged upgrades with explicit rollback points and CI validation at each stage.

## Upgrade strategy (phased)

### Phase 1 — Security/tooling prep (no framework migration)

**Objective:** Reduce risk before major runtime changes.

- Snapshot current baseline:
  - `npm run lint`
  - `npm test`
  - `npm run build-prod`
  - `npm audit --audit-level=moderate`
- Add/update a short compatibility matrix in docs (Node, webpack, Vue, Jest ranges).
- Confirm lockfile reproducibility on clean install (`npm ci`).

**Exit criteria:** reproducible baseline and explicit risk boundaries documented.

### Phase 2 — Bundler/plugin major upgrades

**Objective:** Address `serialize-javascript` path with minimal app-runtime impact.

- Evaluate and upgrade:
  - `copy-webpack-plugin` (major)
  - `css-minimizer-webpack-plugin` (major)
- Apply required webpack config updates.
- Re-run full checks and extension packaging smoke check.

**Exit criteria:** build artifacts unchanged in contract shape (`manifest` + script/style paths) and CI green.

### Phase 3 — Test stack major upgrades

**Objective:** Address `@tootallnate/once`/`jsdom` chain via supported Jest env versions.

- Upgrade together:
  - `jest`
  - `jest-environment-jsdom`
  - related TS/Jest integration if needed
- Fix any changed behavior in tests (DOM defaults, timers, globals).

**Exit criteria:** all tests pass on CI without relaxed assertions.

### Phase 4 — Dev server chain upgrades

**Objective:** Address `uuid`/`sockjs` path through modern dev server.

- Upgrade `webpack-dev-server` major and related CLI/config compatibility.
- Validate `npm start` developer workflow and hot reload behavior.

**Exit criteria:** dev server starts and serves correctly with no critical warnings.

### Phase 5 — Vue ecosystem decision gate

**Objective:** Choose between short-term containment and full migration.

Two options:

1. **Containment path (short-term):**
   - keep Vue 2 runtime with accepted residual risk window,
   - tighten exposure controls and document mitigation timeline.

2. **Migration path (recommended long-term):**
   - migrate to Vue 3-compatible stack (`vue`, `vue-loader`, templates/router/store ecosystem),
   - schedule feature freeze window + dedicated migration branch.

**Exit criteria:** explicit go/no-go decision with owner and timeline.

## Validation protocol per phase

Run on each PR:

- `npm run lint`
- `npm test`
- `npm run build-prod`
- `npm audit --audit-level=moderate`

And track:

- vulnerability count trend,
- any breaking API/config adjustments,
- rollback notes.

## Deliverables

- 1 PR per phase (small, auditable, revertable)
- Updated `plans/` progress notes after each phase
- Final closeout report with:
  - resolved vulnerability classes,
  - accepted residual risk (if any),
  - follow-up milestones for Vue 3 migration
