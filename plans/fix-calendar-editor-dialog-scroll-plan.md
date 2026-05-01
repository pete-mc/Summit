# Plan: Fix Calendar Editor Dialog Scroll

Restore vertical accessibility in the calendar editor dialog by making dialog body content scrollable while preserving the existing dialog size and keeping footer action buttons fixed. The fix will be applied to all `DialogComponent` usages, then validated with targeted regression tests to avoid UI side effects.

## Phases (4)

1. **Phase 1: Add failing scroll behavior tests**
    - **Objective:** Capture the missing-scroll bug and define expected global dialog behavior.
    - **Files/Functions to Modify/Create:**
      - `tests/unit/components/dialog-scrollable-content.spec.ts` (create)
      - `tests/unit/components/calendar-editor-integration.spec.ts`
      - `src/components/DialogComponent.tsx` (behavior under test)
    - **Tests to Write:**
      - `DialogComponent body is vertically scrollable for overflowing content`
      - `calendar-editor-dialog content remains reachable via vertical scroll`
      - `dialog footer actions remain rendered and independently accessible`
    - **Steps:**
        1. Add tests asserting overflowing dialog body supports vertical scrolling.
        2. Add tests asserting footer actions are fixed/non-scrolling in dialog layout.
        3. Run targeted tests to confirm failures before implementation.

2. **Phase 2: Implement global dialog body scrolling with fixed footer**
    - **Objective:** Apply shared layout fix to all dialogs using `DialogComponent`.
    - **Files/Functions to Modify/Create:**
      - `src/components/DialogComponent.tsx`
      - `src/styles/index.css` (only if needed for class-based layout refinement)
    - **Tests to Write:**
      - Update Phase 1 tests to pass against final layout behavior.
    - **Steps:**
        1. Refactor dialog internal structure into header/body/footer regions.
        2. Keep existing dialog size constraints unchanged.
        3. Make only body region vertically scrollable while footer remains fixed.
        4. Run targeted tests and confirm pass.

3. **Phase 3: Calendar editor integration hardening**
    - **Objective:** Ensure calendar editor nested wrappers do not block parent scroll.
    - **Files/Functions to Modify/Create:**
      - `src/pages/SummitCalendar/components/SummitCalendar.tsx` (if wrapper constraints interfere)
      - `src/styles/index.css` (if editor wrapper requires overflow/flex adjustment)
    - **Tests to Write:**
      - `calendar editor long-form sections remain accessible without clipping`
    - **Steps:**
        1. Validate editor container/wrapper styles against new dialog scroll region.
        2. Apply minimal nested layout fixes only where necessary.
        3. Re-run calendar editor integration tests.

4. **Phase 4: Regression and build verification**
    - **Objective:** Confirm no regressions for other dialogs and maintain project health.
    - **Files/Functions to Modify/Create:**
      - Existing dialog/component test files under `tests/unit/components/` as needed.
    - **Tests to Write:**
      - `non-calendar dialog usage remains functional with shared scroll behavior`
    - **Steps:**
        1. Run full dialog/component unit test scope.
        2. Run build/lint verification relevant to UI changes.
        3. Confirm all modified tests pass and no new diagnostics are introduced.

## Open Questions (0)

- None. Constraints confirmed by user:
  - Apply to all dialogs
  - Keep footer buttons fixed
  - Preserve existing dialog size
