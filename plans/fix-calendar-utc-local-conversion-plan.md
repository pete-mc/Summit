# Plan: Fix calendar UTC/local conversion

We will make the client treat API datetimes as UTC at boundaries and local time in UI controls, with one clear conversion in each direction. This removes the 12-hour/offset drift and ensures edit modal values match calendar display and backend payload semantics.

## Phases (4)

1. **Phase 1: Add UTC-to-local regression tests**
    - **Objective:** Reproduce the modal mismatch and conversion drift in tests before code changes.
    - **Files/Functions to Modify/Create:** `tests/unit/components/calendar-editor-payload-shape.spec.ts`, `tests/unit/components/date-time-input-contract.spec.ts`, optional new test file for focused regression.
    - **Tests to Write:** `shows_local_time_for_utc_activity_in_editor`, `saves_local_time_back_to_correct_utc_payload`, `does_not_shift_by_12_hours_for_evening_times`.
    - **Steps:**
        1. Write failing tests for UTC event values shown in local UI.
        2. Run focused tests and confirm failures.
        3. Capture expected conversion behavior in assertions.

2. **Phase 2: Rework editor load/display conversion**
    - **Objective:** Ensure fetched UTC datetime values are converted to local values for editor controls.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/components/DateTimeInputs.tsx`.
    - **Tests to Write:** `editor_defaults_respect_local_time_from_utc_source`, `date_and_time_inputs_render_expected_local_values`.
    - **Steps:**
        1. Remove eager/ambiguous conversions that force UTC presentation in editor state.
        2. Normalize parse/format behavior so date and time fields display local wall time.
        3. Run tests and confirm green.

3. **Phase 3: Rework save-path conversion to UTC**
    - **Objective:** Convert local editor values back to canonical UTC payload once at serialization.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/models/TerrainEventItem.ts`, `src/pages/SummitCalendar/components/SummitCalendar.tsx` save path if required.
    - **Tests to Write:** `serializes_local_editor_time_to_correct_utc`, `preserves_duration_when_saving_after_time_edit`.
    - **Steps:**
        1. Ensure serializer applies a single authoritative local-to-UTC conversion.
        2. Prevent double conversion across component and model layers.
        3. Run tests and confirm green.

4. **Phase 4: Validate and harden regression coverage**
    - **Objective:** Ensure all related calendar tests pass and conversion behavior remains stable.
    - **Files/Functions to Modify/Create:** Existing affected unit tests only if needed.
    - **Tests to Write:** Add/update only for impacted paths (no manual validation).
    - **Steps:**
        1. Run focused calendar/component unit tests.
        2. Run project build/tests relevant to this feature.
        3. Confirm no regressions and finalize.

## Open Questions (1)

1. When timezone metadata is absent in event details, treat `start_datetime`/`end_datetime` as UTC by definition? Chosen: Yes.
