# Plan: Summit Calendar Contrast-Aware Text

Implement contrast-aware event text color for Summit Calendar so event labels remain readable across all section colors, while keeping all styling strictly scoped to `#scheduler` and covered by unit/browser tests.

## Phases (4)

1. **Phase 1: Add failing tests for contrast-aware color selection**
    - **Objective:** Define expected behavior for contrast-aware text color selection and scheduler-scoped event text styling.
    - **Files/Functions to Modify/Create:** `tests/unit/components/`, `tests/browser/` (new/updated calendar style specs)
    - **Tests to Write:** Contrast utility behavior tests, event mapping contract tests, scheduler-scoped style assertions.
    - **Steps:**
        1. Add unit tests for background-to-text color selection (white on dark, black on light).
        2. Add unit tests asserting calendar event config includes computed text color.
        3. Add browser tests asserting rendered event text is contrast-appropriate in scheduler views.

2. **Phase 2: Implement contrast utility and event text color wiring**
    - **Objective:** Compute event text color from event background and apply it in FullCalendar event config.
    - **Files/Functions to Modify/Create:** `src/helpers/` (new contrast helper), `src/pages/SummitCalendar/components/SummitCalendar.tsx`
    - **Tests to Write:** Unit tests for helper edge cases and calendar event mapping usage.
    - **Steps:**
        1. Implement luminance/contrast-based helper returning `#ffffff` or `#000000`.
        2. Wire helper into event mapping to set `textColor` per event.
        3. Ensure event mount fallback keeps computed text color if DOM styling overrides occur.

3. **Phase 3: Add strict scheduler-scoped CSS fallback coverage**
    - **Objective:** Ensure text color remains correct across dayGrid/timeGrid/list and interactive states under `#scheduler` only.
    - **Files/Functions to Modify/Create:** `src/styles/index.css`, browser specs under `tests/browser/`
    - **Tests to Write:** Browser assertions for title/time/list anchor color in normal/hover/selected states.
    - **Steps:**
        1. Add scoped selectors under `#scheduler .fc ...` for event text rendering nodes.
        2. Add/adjust specificity to prevent host link-blue inheritance.
        3. Re-run browser tests and confirm scoped behavior.

4. **Phase 4: Validate regressions and finalize**
    - **Objective:** Verify all impacted tests pass and no unintended style bleed occurs.
    - **Files/Functions to Modify/Create:** Relevant updated tests and implementation files only.
    - **Tests to Write:** Regression checks for non-scheduler FullCalendar usage (if any) staying unchanged.
    - **Steps:**
        1. Run targeted unit and browser test suites.
        2. Fix any regressions with minimal scoped changes.
        3. Confirm all tests pass and prepare completion artifacts.

## Open Questions (1)

1. Use WCAG AA body-text threshold (`4.5:1`) as the cutoff for choosing black vs white text, or prefer a simpler luminance threshold?
