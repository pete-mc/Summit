# Plan: Event validation feedback visibility

This plan fixes silent validation/save failures in the calendar event editor by ensuring every validation error is visibly rendered and backend save failures are surfaced both inline and in a top-level message area. We will follow strict TDD per phase: write failing tests first, implement minimal code, and rerun tests to green.

## Phases (4)

1. **Phase 1: Reproduce and codify missing inline errors**
    - **Objective:** Prove with tests that validation failures for specific fields are currently invisible.
    - **Files/Functions to Modify/Create:** `tests/unit/components/event-editor-inline-validation-contract.spec.ts`, and related validation-contract tests if needed.
    - **Tests to Write:** Tests asserting visibility bindings for `scout_method_elements`, `organisers`, and `member_roles`.
    - **Steps:**
        1. Add failing tests for missing validation render points.
        2. Run the focused test suite and confirm failures.
        3. Keep failures scoped to visibility contract only.

2. **Phase 2: Render all inline validation messages**
    - **Objective:** Ensure all validator-emitted field errors are shown inline in the editor.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`editorTemplate`).
    - **Tests to Write:** Tests verifying inline output for all validation keys emitted by `validateSummitCalendarActivity`.
    - **Steps:**
        1. Add minimal UI bindings for missing validation keys.
        2. Run tests and confirm green.
        3. Preserve existing markup/style patterns.

3. **Phase 3: Surface save failures (create/update) clearly**
    - **Objective:** Show save failures to users in both a top-level error area and relevant inline field messages where available.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`saveActivity` and save-error presentation state), `src/services/createNewEvent.ts`, `src/services/updateEvent.ts`.
    - **Tests to Write:**
        - Create failure path surfaces backend messages.
        - Update failure path surfaces thrown messages.
        - Backend messages are displayed verbatim.
        - Editor remains open and preserves edits on save failure.
    - **Steps:**
        1. Write failing tests for create/update failure visibility.
        2. Normalize save-service failure contracts.
        3. Handle failures in `saveActivity` and render all available messages.
        4. Rerun tests to green.

4. **Phase 4: Regression hardening**
    - **Objective:** Prevent future silent failures and key drift.
    - **Files/Functions to Modify/Create:** Existing unit tests under `tests/unit/components/` for editor/save contracts.
    - **Tests to Write:**
        - Contract test asserting validator keys map to rendered editor validation anchors.
        - Regression test that all backend validation messages are shown (not just first).
    - **Steps:**
        1. Add/extend guard tests for key alignment.
        2. Run targeted tests, then broader relevant suites.
        3. Confirm no regressions in save/edit flows.

## Open Questions resolved

1. Save failures should be shown both inline and in a top-level message area.
2. If backend returns multiple validation messages, show all.
3. Backend message text should be shown verbatim when present.
4. On save failure, keep the editor open and preserve edits.
