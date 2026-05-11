# Phase 3 Complete: Rework save-path conversion to UTC

Phase 3 established deterministic save-boundary serialization and reinforced single-authority conversion in the model layer. It also added explicit tests proving intermediate editor state is preserved until serialization and that missing datetimes do not produce time-dependent output.

**Files created/changed:**

- `src/pages/SummitCalendar/models/TerrainEventItem.ts`
- `tests/unit/components/calendar-editor-payload-shape.spec.ts`
- `plans/fix-calendar-utc-local-conversion-plan-phase-3-complete.md`

**Functions created/changed:**

- `normalizeBoundaryDateTime`
- `TerrainEventItem` constructor datetime assignments

**Tests created/changed:**

- `serializes_local_editor_time_to_correct_utc`
- `preserves_duration_when_saving_after_time_edit`
- `keeps_local_editor_datetime_in_state_until_serialization_boundary`
- `serializes_missing_boundary_datetimes_as_empty_strings_deterministically`

**Review Status:** APPROVED

**Git Commit Message:**
fix: harden UTC serialization boundary

- centralize deterministic boundary datetime normalization
- avoid non-deterministic fallback for missing datetimes
- add tests proving single conversion authority
