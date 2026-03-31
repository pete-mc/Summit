# Plan: Add Unit Testing Foundation

This plan introduces Jest-based unit testing in centralized test folders to support safe, large-scale refactoring. It starts with low-coupling pure logic, then expands to business models and a pilot set of service-layer tests, with soft coverage reporting and PR-required test pass gates.

## Phases (5)

1. **Phase 1: Bootstrap Jest Runtime and CI Gate**
    - **Objective:** Create a working Jest + TypeScript test runtime and require tests to pass on pull requests before merge to `main`.
    - **Files/Functions to Modify/Create:** `package.json`, Jest config file(s), test TypeScript config file(s), `tests/unit/setup/*`, GitHub workflow under `.github/workflows/*`.
    - **Tests to Write:** `jest_runtime_boots.spec.ts`, `alias_resolution.spec.ts`, `jsdom_environment_available.spec.ts`.
    - **Steps:**
        1. Add Jest dependencies and centralized test scripts (`test`, `test:watch`, `test:coverage`) and run tests to confirm initial failing state.
        2. Configure Jest for TypeScript, `@/*` alias resolution, and browser-like environment, then rerun the smoke tests.
        3. Add centralized test setup utilities in `tests/unit/setup` and verify smoke tests pass.
        4. Update CI so PRs must pass unit tests before merge to `main`.

2. **Phase 2: Add Helper Unit Tests (Centralized)**
    - **Objective:** Build fast confidence with deterministic helper tests that are independent of DOM and host runtime.
    - **Files/Functions to Modify/Create:** `tests/unit/helpers/HasPropAtPath.spec.ts`, `tests/unit/helpers/VerticleText.spec.ts`, `tests/unit/helpers/CompressGuids.spec.ts`; source files only if defects are revealed.
    - **Tests to Write:** `hasPropAtPath_nested_and_falsey_cases`, `verticleText_expected_transformation`, `compressGuids_roundtrip_guid_batches`, `compressGuidsAndDates_roundtrip_preserves_data`.
    - **Steps:**
        1. Create failing helper tests in `tests/unit/helpers` for expected behavior and edge cases.
        2. Run helper tests to confirm failures are meaningful.
        3. Implement only minimal source fixes required for passing behavior.
        4. Rerun helper tests and confirm all pass.

3. **Phase 3: Add Model/Business Logic Tests**
    - **Objective:** Lock in report-calculation logic with representative fixtures and deterministic assertions.
    - **Files/Functions to Modify/Create:** `tests/unit/models/MilestonePlanningItem.spec.ts`, `tests/unit/models/OasReportItem.spec.ts`, `tests/unit/models/PeakAwardItem.spec.ts`, `tests/unit/models/SummitAchievement.spec.ts`; model source files only if failing tests expose defects.
    - **Tests to Write:** milestone threshold and percentage tests, OAS dedupe/highest-stage tests, peak award aggregation tests, summit achievement mapping/default tests.
    - **Steps:**
        1. Write failing model tests from current business rules and fixture data.
        2. Run tests to validate red-state coverage of core logic.
        3. Apply minimal targeted fixes to source where necessary.
        4. Rerun model and helper suites and confirm green state.

4. **Phase 4: Pilot Service Layer Tests**
    - **Objective:** Validate API wrapper contracts for a pilot subset before scaling to all services.
    - **Files/Functions to Modify/Create:** pilot tests for `src/services/fetchActivity.ts`, `src/services/fetchUnitMembers.ts`, `src/services/getLogbookData.ts`; shared mocks under `tests/unit/services/mocks/*`; source service files only if defects are exposed.
    - **Tests to Write:** missing-token early-return tests, auth header/method tests, success result parsing tests, non-OK/error fallback tests.
    - **Steps:**
        1. Implement centralized fetch/state mock helpers and write failing tests for the three pilot services.
        2. Run the pilot suite and confirm expected failures.
        3. Apply minimal service fixes only where behavior is incorrect.
        4. Rerun pilot + prior suites and confirm no regressions.

5. **Phase 5: Soft Coverage and Team Guardrails**
    - **Objective:** Publish soft coverage output and document centralized testing conventions without hard coverage failure gates.
    - **Files/Functions to Modify/Create:** `package.json`, Jest coverage config, docs update in `README.md` or `docs/*`.
    - **Tests to Write:** no new unit logic required; coverage/reporting verification via CI output.
    - **Steps:**
        1. Enable coverage reporting as informational (soft), not a failing threshold.
        2. Ensure PR CI reports test and coverage results while failing only on test failures.
        3. Document centralized test structure, naming patterns, and mock strategy.
        4. Define next-wave expansion targets beyond pilot services.

## Open Questions (2)

1. Should centralized tests live under only `tests/unit/*`, or split by layer as `tests/unit/helpers|models|services/*` plus shared fixtures under `tests/unit/fixtures/*`?
2. For PR checks, should coverage summary be posted in the check output only, or also uploaded as an artifact for trend tracking?
