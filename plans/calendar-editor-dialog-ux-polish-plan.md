# Plan: Calendar Editor Dialog UX Polish

Improve the calendar event edit dialog by giving the form a reliable field layout, adding tokenized spacing between controls, preventing border/overflow bleed, making custom dialog footers sticky, and adding browser-level visual/layout coverage. The changes stay focused on layout and presentation while preserving existing event editing behavior, validation logic, persistence, and API payloads.

## Phases

1. **Phase 1: Lock Down Current Layout Contracts**
    - **Objective:** Add regression coverage that describes the desired spacing, overflow, footer, and visual behavior before changing the UI.
    - **Files/Functions to Modify/Create:**
        - `tests/unit/components/calendar-editor-integration.spec.ts`
        - `tests/unit/components/dialog-scrollable-content.spec.ts`
        - Possibly new `tests/unit/components/calendar-editor-layout-spacing-contract.spec.ts`
        - Browser-level visual/layout test files if an existing browser test harness is present
    - **Tests to Write:**
        - Test that `.editor-container` defines explicit tokenized vertical spacing.
        - Test that editor labels/field groups use block, flex, or grid layout rather than raw inline flow.
        - Test that dialog body prevents horizontal overflow while preserving vertical scroll.
        - Test that custom `footer` content receives sticky/fixed layout treatment outside the scrollable body.
        - Test or scaffold browser-level coverage for wide and narrow calendar editor dialog layouts.
    - **Steps:**
        1. Write failing CSS/source contract tests for editor field spacing and layout hooks.
        2. Write a failing dialog overflow contract for `overflowX` protection.
        3. Write a failing custom footer layout contract for sticky/fixed footer treatment.
        4. Investigate existing browser-level test support and add the smallest failing visual/layout coverage contract that fits the repository.
        5. Run targeted tests and confirm they fail for the expected reasons.

2. **Phase 2: Add Structured Field Layout**
    - **Objective:** Replace the dialog’s visually cramped field flow with explicit, reusable field containers.
    - **Files/Functions to Modify/Create:**
        - `src/pages/SummitCalendar/components/SummitCalendar.tsx`
        - `src/styles/index.css`
        - Existing editor layout tests
    - **Tests to Write:**
        - Test that the editor uses stable field class hooks such as editor field, field label, field control, and field help/status containers.
        - Test that required markers and validation/warning messages remain discoverable through existing hooks.
    - **Steps:**
        1. Update tests to expect explicit layout classes/hooks while preserving existing data attributes.
        2. Wrap each major editor field in a consistent field container.
        3. Separate label text from controls so spacing is CSS-driven rather than browser inline flow.
        4. Add tokenized CSS using existing `--summit-space-*`, border, and typography tokens.
        5. Run targeted tests and fix only layout-related failures.

3. **Phase 3: Improve Date and Time Group Spacing**
    - **Objective:** Make Start/End date and time controls readable with a responsive two-column layout that prevents adjacent full-width borders from colliding.
    - **Files/Functions to Modify/Create:**
        - `src/pages/SummitCalendar/components/SummitCalendar.tsx`
        - `src/styles/index.css`
        - Calendar editor layout tests
    - **Tests to Write:**
        - Test that Start and End controls are inside a dedicated date/time layout wrapper.
        - Test that date/time input groups use CSS `gap`.
        - Test that the layout uses two columns when space allows and stacks on narrow widths.
    - **Steps:**
        1. Add failing tests for date/time group layout hooks, two-column behavior, and tokenized gaps.
        2. Introduce a dedicated date/time group structure for Start and End sections.
        3. Use responsive grid/flex styles so paired date/time inputs do not overrun each other.
        4. Keep existing `DatePickerComponent` and `TimePickerComponent` behavior unchanged.
        5. Run targeted tests and verify existing payload/validation tests still pass.

4. **Phase 4: Harden Dialog Surface, Body, and Custom Footers**
    - **Objective:** Prevent borders and content from visually overrunning the dialog bounds, and make all custom footers sticky outside the scroll body.
    - **Files/Functions to Modify/Create:**
        - `src/components/DialogComponent.tsx`
        - `src/styles/index.css`
        - `tests/unit/components/dialog-scrollable-content.spec.ts`
        - Possibly `tests/unit/components/dialog-open-close.spec.ts`
    - **Tests to Write:**
        - Test that the dialog body uses vertical scrolling and horizontal overflow protection.
        - Test that `.summit-dialog-surface` uses `box-sizing: border-box`.
        - Test that custom `footer` content gets sticky/fixed footer treatment equivalent to the `buttons` pathway.
        - Test that existing footer-outside-scroll behavior remains intact.
    - **Steps:**
        1. Add/adjust failing tests for horizontal overflow, surface box sizing, and custom sticky footer handling.
        2. Add `overflowX: "hidden"` or equivalent to the dialog body wrapper.
        3. Add `box-sizing: border-box` to `.summit-dialog-surface`.
        4. Refactor the custom footer pathway so all custom footers receive shared sticky/flex footer treatment.
        5. Preserve existing dialog dimensions and vertical scroll behavior.
        6. Run dialog tests and calendar editor integration tests.

5. **Phase 5: Normalize Calendar Footer Button Spacing**
    - **Objective:** Give Save/Delete/Open/Cancel actions consistent spacing, wrapping, and separation from the scrollable form while benefiting from the shared sticky custom footer behavior.
    - **Files/Functions to Modify/Create:**
        - `src/pages/SummitCalendar/components/SummitCalendar.tsx`
        - `src/styles/index.css`
        - Footer/dialog tests
    - **Tests to Write:**
        - Test that the calendar footer has a flex layout with tokenized `gap`.
        - Test that button spacing does not depend solely on global `.summit-button` left margins.
        - Test that the footer remains outside scrollable dialog content.
    - **Steps:**
        1. Add failing footer layout tests.
        2. Add or refine a calendar-specific footer class for action grouping.
        3. Use `gap`, `flex-wrap`, and alignment styles for robust narrow-width behavior.
        4. Avoid broad global `.summit-button` changes unless tests prove they are safe.
        5. Run footer, dialog, and calendar editor tests.

6. **Phase 6: Browser-Level Visual Regression and Full Verification**
    - **Objective:** Verify the UX polish does not regress event editing, validation, accessibility hooks, or build output, and add browser-level coverage for the visible layout issues.
    - **Files/Functions to Modify/Create:**
        - Browser-level test files and configuration if required
        - Existing unit tests if visual coverage reveals missing layout hooks
        - Plan completion files under `plans/`
    - **Tests to Write:**
        - Browser-level layout test for the editor dialog at a wider viewport.
        - Browser-level layout test for the editor dialog at a narrow viewport.
        - Assertions that borders stay inside the dialog surface, spacing is visible between fields, date/time controls align in two columns when space allows, the footer remains visible/sticky, and no horizontal bleed appears.
    - **Steps:**
        1. Add or complete the browser-level visual/layout test harness using the lightest-fit project-compatible tooling.
        2. Cover wide and narrow dialog widths.
        3. Run the full unit test suite.
        4. Run browser-level visual/layout tests.
        5. Run the development build.
        6. Review changed CSS for token usage and absence of hard-coded one-off spacing.
        7. Confirm existing hooks such as `data-editor-layout`, `data-editor-validation`, `data-editor-warning`, and `data-editor-action` are preserved.
        8. Create the final plan completion summary after all phases pass.

## Open Questions

1. None. User selected responsive two-column date/time layout, shared sticky custom footers, and browser-level visual coverage.
