# Plan: Replace Syncfusion with OSS Stack

Replace all Syncfusion usage with open-source alternatives that do not require license keys, using an incremental but hard-cutover migration path. The implementation will prioritize low-risk UI controls first, then shared grid infrastructure, then scheduler and complex selectors, and finally full dependency/style/build cleanup to achieve zero Syncfusion footprint.

## Phases 6

1. **Phase 1: Baseline, Contract Tests, and Inventory**
    - **Objective:** Establish behavior contracts and a complete Syncfusion usage inventory before migration.
    - **Files/Functions to Modify/Create:** `tests/unit/**` (new baseline tests), inventory notes in `plans/`, read-only analysis of `src/pages/**` and `src/styles/**`.
    - **Tests to Write:** `syncfusion-import-inventory.spec.ts`, `baseline-page-render-contracts.spec.tsx`, `syncfusion-license-ci-guard.spec.ts`.
    - **Steps:**
        1. Write failing inventory and behavior-contract tests for current Syncfusion-backed features.
        2. Run tests to confirm failures where expected and validate baseline coverage.
        3. Document exact component-to-replacement mapping and acceptance criteria.
        4. Re-run targeted baseline tests to ensure deterministic starting point.

2. **Phase 2: Low-Risk UI Component Migration**
    - **Objective:** Replace keyed lightweight controls with OSS equivalents and preserve behavior.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/pages/PresentAwards/components/PresentAwards.tsx`, shared wrappers in `src/components/` if needed.
    - **Tests to Write:** `toast-behavior.spec.tsx`, `dialog-open-close.spec.tsx`, `date-time-input-contract.spec.tsx`, `dropdown-selection-contract.spec.tsx`.
    - **Steps:**
        1. Write failing tests for toast, dialog, date/time pickers, and simple dropdown interactions.
        2. Replace components with OSS stack (no keys) and keep event/state wiring stable.
        3. Run tests and fix only parity issues required for functional equivalence.
        4. Re-run broader impacted test set to confirm no regressions.

3. **Phase 3: Shared DataGrid Migration (TanStack Table)**
    - **Objective:** Replace all Syncfusion grid usage with TanStack Table and equivalent export capability.
    - **Files/Functions to Modify/Create:** `src/pages/MilestoneReport/components/MilestoneReport.tsx`, `src/pages/OasReport/components/OasReport.tsx`, `src/pages/PeakAward/components/PeakAward.tsx`, `src/pages/PresentAwards/components/PresentAwards.tsx`, `src/pages/SectionSummary/components/UnitSummary.tsx`, shared grid abstraction in `src/components/`.
    - **Tests to Write:** `data-grid-sort-and-columns.spec.tsx`, `data-grid-toolbar-actions.spec.tsx`, `data-grid-excel-export-functional.spec.ts`, `data-grid-pdf-export-functional.spec.ts`.
    - **Steps:**
        1. Write failing grid-contract tests capturing sorting, column rendering, and toolbar/export actions.
        2. Implement a shared TanStack-based grid abstraction with functional export support.
        3. Migrate one report page, run tests, then migrate remaining grid pages incrementally.
        4. Re-run full grid regression test suite and resolve parity gaps.

4. **Phase 4: Form Validation and Grouped Multi-Select**
    - **Objective:** Replace Syncfusion validation and DropDownTree with grouped multi-select UX.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, validation helpers in `src/helpers/` or `src/shared/`.
    - **Tests to Write:** `summit-calendar-validation-rules.spec.tsx`, `grouped-multiselect-selection.spec.tsx`, `calendar-editor-payload-shape.spec.tsx`.
    - **Steps:**
        1. Write failing tests for current validation behavior and organizer/member selection semantics.
        2. Implement OSS validation flow and grouped multi-select replacement.
        3. Run tests and adjust mappings until payload and rule behavior are functionally equivalent.
        4. Re-run impacted page-level tests for regression protection.

5. **Phase 5: Scheduler Migration (FullCalendar, Hard Cutover)**
    - **Objective:** Replace `ScheduleComponent` with FullCalendar community edition in a hard cutover.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, optional scheduler adapter in `src/components/`.
    - **Tests to Write:** `calendar-view-switching.spec.tsx`, `calendar-event-crud.spec.tsx`, `calendar-editor-integration.spec.tsx`, `calendar-render-contract.spec.tsx`.
    - **Steps:**
        1. Write failing tests for view switching, event CRUD, and custom editor interactions.
        2. Implement FullCalendar integration with existing data/service hooks.
        3. Execute hard cutover (no feature flag), remove old scheduler paths, and run tests.
        4. Re-run full calendar + integration test scope and fix parity defects.

6. **Phase 6: Remove Syncfusion Footprint from Build, Styles, and Docs**
    - **Objective:** Fully remove Syncfusion dependencies, styles, and licensing hooks.
    - **Files/Functions to Modify/Create:** `package.json`, `.github/workflows/build.yaml`, `src/styles/fluent.css`, `src/styles/fluent.min.css`, `src/styles/fluent.scss`, `src/styles/individual-scss/**`, `README.md`, relevant docs.
    - **Tests to Write:** `no-syncfusion-imports.spec.ts`, `build-without-license-key.spec.ts`, final smoke tests for migrated pages.
    - **Steps:**
        1. Write failing tests/assertions that detect any remaining Syncfusion imports/usages.
        2. Remove Syncfusion packages, scripts, CI license activation, and obsolete style assets.
        3. Run build and full test suite until clean.
        4. Finalize documentation for the new OSS component stack.

## Open Questions 1

1. Do you want this executed as one PR or split into multiple PRs by phase for safer review/rollback?
