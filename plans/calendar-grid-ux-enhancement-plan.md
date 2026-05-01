# Plan: Calendar, Event Editor, and Grid UX Enhancement

Improve the usability, speed, visual quality, and accessibility of Summit’s calendar workflows and grid reports through test-first incremental phases. The plan prioritizes event editor speed first, applies soft conflict warnings, keeps draft persistence local-only, and delivers one PR per phase for safer review and rollback.

## Phases 6

1. **Phase 1: UX Baseline and Contract Tests**
    - **Objective:** Establish test contracts for editor speed, feedback states, and grid UX so improvements are measurable and regression-safe.
    - **Files/Functions to Modify/Create:** `tests/unit/components/*`, `tests/unit/smoke/*`, `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/components/DataGrid.tsx`.
    - **Tests to Write:** `calendar-loading-empty-error-contract.spec.ts`, `event-editor-speed-contract.spec.ts`, `data-grid-empty-sort-indicator-contract.spec.ts`.
    - **Steps:**
        1. Write failing tests for calendar loading/empty/error states, editor interaction speed proxies, and grid visual contracts.
        2. Run targeted tests to confirm failures.
        3. Add minimal non-functional hooks/markers needed for future phases.
        4. Re-run tests to stabilize baseline contracts.

2. **Phase 2: Event Editor Speed and Workflow Optimizations (Priority 1)**
    - **Objective:** Make event create/edit flow significantly faster and clearer for day-to-day use.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/helpers/SummitCalendarValidation.ts`, optional local helper under `src/helpers/`.
    - **Tests to Write:** `event-editor-inline-validation-contract.spec.ts`, `event-editor-shortcuts.spec.ts`, `event-editor-local-draft-persistence.spec.ts`, `event-editor-defaults-and-layout-contract.spec.ts`.
    - **Steps:**
        1. Write failing tests for inline field validation, local draft autosave, save shortcuts, and smart defaults.
        2. Implement inline validation (replace disruptive alert flow), compact grouped layout, and keyboard save shortcuts.
        3. Implement local-only draft persistence (localStorage/sessionStorage) with safe restore behavior.
        4. Re-run targeted tests and full suite.

3. **Phase 3: Calendar Navigation and Visual Clarity**
    - **Objective:** Improve discoverability and confidence in calendar interactions.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/styles/index.css`.
    - **Tests to Write:** `calendar-quick-filters.spec.ts`, `calendar-view-persistence.spec.ts`, `calendar-legend-and-range-context.spec.ts`, `calendar-keyboard-new-event.spec.ts`.
    - **Steps:**
        1. Write failing tests for quick filters, view persistence, and contextual indicators.
        2. Add quick filter controls and date-range context display.
        3. Add event color legend and improved calendar selector visibility.
        4. Re-run targeted and regression tests.

4. **Phase 4: Event Intelligence and Soft Conflict Warnings**
    - **Objective:** Add guardrails that inform users without blocking progress.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/helpers/SummitCalendarValidation.ts`, optional conflict helper.
    - **Tests to Write:** `event-conflict-soft-warning.spec.ts`, `event-warning-visibility-contract.spec.ts`, `event-save-with-warning-allowed.spec.ts`.
    - **Steps:**
        1. Write failing tests for overlap/conflict detection warning behavior.
        2. Implement soft warning presentation (non-blocking save allowed).
        3. Ensure warning text is clear and references conflicting items.
        4. Re-run calendar/editor tests and full suite.

5. **Phase 5: Grid Functionality and Visual Upgrade**
    - **Objective:** Improve grid readability and productivity with stronger interaction patterns.
    - **Files/Functions to Modify/Create:** `src/components/DataGrid.tsx`, `src/components/gridExport.ts`, report pages under `src/pages/*Report*/components/*.tsx`, `src/styles/index.css`.
    - **Tests to Write:** `data-grid-column-filtering.spec.ts`, `data-grid-pagination-contract.spec.ts`, `data-grid-sort-indicator-and-aria.spec.ts`, `data-grid-export-feedback.spec.ts`.
    - **Steps:**
        1. Write failing tests for filtering, pagination, sort indicators, accessibility attributes, and export feedback.
        2. Implement global/column filtering and pagination controls.
        3. Improve sort and empty/loading visuals, plus export completion feedback.
        4. Re-run targeted tests and full suite.

6. **Phase 6: Design System Polish and Accessibility Consistency**
    - **Objective:** Create a cohesive visual system across calendar/editor/grid and improve accessibility consistency.
    - **Files/Functions to Modify/Create:** `src/styles/index.css`, shared components in `src/components/`, possibly page-level class usage in affected views.
    - **Tests to Write:** `design-token-contract.spec.ts`, `focus-ring-and-contrast-contract.spec.ts`, `ui-consistency-smoke.spec.ts`.
    - **Steps:**
        1. Write failing tests/contracts for tokenized styles and focus/contrast expectations.
        2. Introduce CSS variables for spacing, typography, color hierarchy, and component states.
        3. Normalize button/input/dialog/grid visual hierarchy.
        4. Re-run full validation and finalize PR-ready UX polish.

## Delivery Strategy

- **One PR per phase** (6 PRs total), with independent review/rollback safety.
- Each phase follows strict red → green TDD and includes targeted + regression validation.
- Phase merge order is fixed unless a blocker requires re-sequencing.

## Open Questions 1

1. Should accessibility compliance target WCAG 2.1 AA as a strict merge gate for these UX phases?
