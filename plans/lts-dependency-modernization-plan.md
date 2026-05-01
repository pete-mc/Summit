# Plan: LTS Dependency Modernization

Upgrade project dependencies to latest LTS-compatible versions in one consolidated PR while minimizing risk through phased, test-first checkpoints. This plan defers Vue 3 migration, pins CI/runtime to Node 24, adopts flat ESLint v9 config, and keeps ecosystem upgrades on current major trains unless explicitly approved otherwise.

## Phases (6)

1. **Phase 1: Baseline and Node 24 Alignment**
    - **Objective:** Establish a stable baseline and pin runtime/tooling to Node 24 in local/CI paths.
    - **Files/Functions to Modify/Create:** `.github/workflows/build.yaml`, `package.json` (engines/scripts if needed), optional `.nvmrc`.
    - **Tests to Write:** `tests/unit/smoke/dependency_upgrade_baseline.spec.ts` (if baseline smoke coverage gap exists).
    - **Steps:**
        1. Write/adjust baseline smoke test first to validate test runner, module aliases, and jsdom runtime.
        2. Run baseline tests and confirm they pass before changes.
        3. Update Node references to 24 where appropriate and rerun tests/build to confirm green state.

2. **Phase 2: Type Definitions and Safe Patch/Minor Sweep**
    - **Objective:** Align type packages and update low-risk dependencies to latest compatible releases on current major trains.
    - **Files/Functions to Modify/Create:** `package.json`, `package-lock.json`.
    - **Tests to Write:** `tests/unit/smoke/types_alignment.spec.ts` (if needed to guard compile/runtime contract).
    - **Steps:**
        1. Add/adjust a targeted type-smoke test first if no equivalent assertion exists.
        2. Upgrade `@types/*` packages to match current runtime majors (Node 24, Jest 29, React 18).
        3. Upgrade safe patch/minor dependencies, then run tests/build to verify no regressions.

3. **Phase 3: TypeScript 5 Migration**
    - **Objective:** Move TypeScript toolchain from 4.9 to latest stable 5.x with minimal config churn.
    - **Files/Functions to Modify/Create:** `package.json`, `tsconfig.json`, `tsconfig.test.json`, `jest.config.js` (only if required).
    - **Tests to Write:** `tests/unit/smoke/typescript5_compat.spec.ts` (or equivalent compile contract check).
    - **Steps:**
        1. Add/adjust failing compatibility assertion for TypeScript 5-sensitive behavior first.
        2. Upgrade `typescript` and TS-adjacent tooling (`ts-jest`/`ts-loader`) to compatible versions.
        3. Resolve compile/config issues and rerun unit tests and production build until green.

4. **Phase 4: ESLint v9 Flat Config Migration**
    - **Objective:** Upgrade lint stack to ESLint 9 and migrate from legacy `.eslintrc` to flat config.
    - **Files/Functions to Modify/Create:** `eslint.config.js` (new), remove/retire `.eslintrc.json`, `package.json`.
    - **Tests to Write:** `tests/unit/smoke/lint_stack_loads.spec.ts` (or equivalent lint-config smoke validation).
    - **Steps:**
        1. Create a failing lint-config smoke check (or run lint expecting failure) to validate migration needs.
        2. Upgrade `eslint`, `@typescript-eslint/*`, and Prettier lint integration to compatible versions.
        3. Implement flat config and rerun lint/tests/build to ensure full compatibility.

5. **Phase 5: Build Tooling Refresh (Current Major Trains Only)**
    - **Objective:** Refresh webpack/babel/loaders/plugins to latest versions within approved major boundaries.
    - **Files/Functions to Modify/Create:** `package.json`, `package-lock.json`, `webpack.config.js` (only if required by upgrade behavior).
    - **Tests to Write:** `tests/unit/smoke/build_pipeline_contract.spec.ts` (if current smoke coverage is insufficient).
    - **Steps:**
        1. Add/adjust a failing build smoke check first to verify emitted artifact contract.
        2. Upgrade tooling packages in small groups and run build after each group.
        3. Confirm extension output paths and artifact shape remain unchanged.

6. **Phase 6: Consolidation, Verification, and PR Readiness**
    - **Objective:** Complete one-PR delivery with full verification and clean documentation.
    - **Files/Functions to Modify/Create:** `README.md` (if commands/requirements changed), `.github/workflows/build.yaml` (final touch-ups only), lockfile.
    - **Tests to Write:** `tests/unit/smoke/final_upgrade_regression.spec.ts` (only if uncovered gap remains).
    - **Steps:**
        1. Run full suite to observe any failing checks first and address the smallest necessary fixes.
        2. Execute full validation (`npm test`, production build, and CI-equivalent checks).
        3. Finalize one consolidated commit/PR notes with risks, rollback path, and verification summary.

## Open Questions (1)

1. No blocking questions remain; approved decisions recorded: defer Vue 3 migration, pin Node 24, use ESLint v9 flat config, stay on current major trains, and deliver as one PR.
