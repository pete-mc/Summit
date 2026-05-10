# Phase 1 Complete: Add regression tests for time edits

Added focused regression coverage for the datetime picker bug where time-only input can corrupt datetime state and blank date controls. The new tests intentionally fail against current behavior, establishing a clear red baseline for the fix phase.

**Files created/changed:**

- plans/fix-datetime-picker-date-blanking-plan.md
- tests/unit/components/calendar-datetime-picker-date-blanking.spec.ts
- plans/fix-datetime-picker-date-blanking-phase-1-complete.md

**Functions created/changed:**

- Phase 1 datetime picker date blanking regressions > keeps_start_date_when_start_time_changes_to_hh_mm
- Phase 1 datetime picker date blanking regressions > keeps_end_date_when_end_time_changes_to_hh_mm
- Phase 1 datetime picker date blanking regressions > keeps_prior_datetime_when_time_input_invalid
- Phase 1 datetime picker date blanking regressions > does_not_blank_date_input_after_time_edit

**Tests created/changed:**

- keeps_start_date_when_start_time_changes_to_hh_mm
- keeps_end_date_when_end_time_changes_to_hh_mm
- keeps_prior_datetime_when_time_input_invalid
- does_not_blank_date_input_after_time_edit

**Review Status:** APPROVED

**Git Commit Message:**
test: add datetime picker regressions

- add focused red tests for start/end HH:mm edits
- assert invalid time preserves prior datetime values
- capture UI regression where date input blanks after edit
