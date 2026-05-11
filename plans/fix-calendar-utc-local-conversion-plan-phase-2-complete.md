# Phase 2 Complete: Rework editor load/display conversion

Phase 2 made UTC/no-offset datetime parsing explicit for editor display and normalized datetime handling in calendar editor load paths. This ensures UTC backend values render correctly as local wall time in date/time controls and removes ambiguous conversion paths.

**Files created/changed:**

- `src/components/DateTimeInputs.tsx`
- `src/pages/SummitCalendar/components/SummitCalendar.tsx`
- `tests/unit/components/calendar-editor-payload-shape.spec.ts`
- `tests/unit/components/date-time-input-contract.spec.ts`
- `plans/fix-calendar-utc-local-conversion-plan-phase-2-complete.md`

**Functions created/changed:**

- `toDateValue`
- `toTimeValue`
- `toDisplayMoment`
- `normalizeEditorDateTime`
- `handleDateTimeChange`
- `buildEditorDefaults`
- `getActivity`
- `newActivity`

**Tests created/changed:**

- `date_and_time_inputs_render_expected_local_values`
- `editor_defaults_respect_local_time_from_utc_source`

**Review Status:** APPROVED

**Git Commit Message:**
fix: normalize calendar editor UTC display

- parse UTC and no-offset strings consistently for local UI
- normalize editor datetime load paths to remove ambiguity
- add regression tests for local display expectations
