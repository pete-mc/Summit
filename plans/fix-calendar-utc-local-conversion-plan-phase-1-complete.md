# Phase 1 Complete: Add UTC-to-local regression tests

Phase 1 added deterministic regression coverage for UTC/local conversion behavior and fixed the surfaced client mismatch so editor time display and save payload semantics align with UTC backend expectations. The implementation and tests were independently reviewed and approved.

**Files created/changed:**

- `src/components/DateTimeInputs.tsx`
- `src/pages/SummitCalendar/components/SummitCalendar.tsx`
- `tests/unit/components/calendar-editor-payload-shape.spec.ts`
- `tests/unit/components/date-time-input-contract.spec.ts`
- `plans/fix-calendar-utc-local-conversion-plan.md`
- `plans/fix-calendar-utc-local-conversion-plan-phase-1-complete.md`

**Functions created/changed:**

- `toDateValue`
- `toTimeValue`
- `handleDateTimeChange`

**Tests created/changed:**

- `shows_local_time_for_utc_activity_in_editor`
- `does_not_shift_by_12_hours_for_evening_times`
- `saves_local_time_back_to_correct_utc_payload`

**Review Status:** APPROVED

**Git Commit Message:**
fix: correct UTC/local calendar editing

- add deterministic regressions for UTC/local editor times
- prevent 12-hour drift in datetime edit recomposition
- ensure local edits serialize to correct UTC payload
