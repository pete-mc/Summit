## Plan: Fix datetime picker date blanking

Prevent event edit date/time fields from blanking when users enter time-only values by enforcing strict fragment parsing and safe local-time composition in the editor state layer, while preserving prior values on invalid input. The implementation follows TDD with focused regressions first, then minimal code changes and verification.

**Phases 4**
1. **Phase 1: Add regression tests for time edits**
    - **Objective:** Reproduce and lock in the reported bug behavior with failing tests before implementation.
    - **Files/Functions to Modify/Create:** `tests/unit/components/*calendar*` specs covering `handleDateTimeChange` behavior and rendered input bindings.
    - **Tests to Write:**
        - `keeps_start_date_when_start_time_changes_to_hh_mm`
        - `keeps_end_date_when_end_time_changes_to_hh_mm`
        - `keeps_prior_datetime_when_time_input_invalid`
        - `does_not_blank_date_input_after_time_edit`
    - **Steps:**
        1. Add unit/integration tests that simulate editing `start_time` and `end_time` with `HH:mm` input.
        2. Run targeted tests and confirm they fail against current behavior.
        3. Ensure assertions capture no date blanking and prior-value retention on invalid time.

2. **Phase 2: Implement strict local-time composition in editor handler**
    - **Objective:** Remove fallback parsing warnings and prevent malformed datetime state updates.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`handleDateTimeChange`).
    - **Tests to Write:** Satisfy Phase 1 failing tests with minimal production changes.
    - **Steps:**
        1. Parse date fragments with strict `YYYY-MM-DD` and time fragments with strict `HH:mm`.
        2. Compose local datetime fragments deterministically for `start_*` and `end_*` updates.
        3. If parsed input is invalid, retain the prior datetime value instead of writing an invalid value.

3. **Phase 3: Add adjacent-path regression coverage**
    - **Objective:** Ensure symmetric behavior and payload validity across save/validation paths.
    - **Files/Functions to Modify/Create:** existing calendar editor payload/validation-related tests under `tests/unit/components`.
    - **Tests to Write:**
        - `produces_valid_datetime_payload_after_time_edit`
        - `validation_paths_handle_updated_start_end_without_blanking`
    - **Steps:**
        1. Extend payload/validation tests to include edited `HH:mm` values.
        2. Run targeted suites and confirm green.
        3. Verify no new warnings/errors are introduced by changed input handling.

4. **Phase 4: Final verification and completion artifacts**
    - **Objective:** Confirm end-to-end correctness and document completion.
    - **Files/Functions to Modify/Create:** `plans/fix-datetime-picker-date-blanking-phase-<N>-complete.md`, `plans/fix-datetime-picker-date-blanking-complete.md`.
    - **Tests to Write:** none.
    - **Steps:**
        1. Run relevant unit tests and broader test run for confidence.
        2. Record completed files/functions/tests per phase.
        3. Prepare final completion report and commit summaries.

**Open Questions 2**
1. Date/time composition mode: local-time composition in editor state (selected).
2. Invalid time entry behavior: preserve prior datetime value instead of blanking (selected).
