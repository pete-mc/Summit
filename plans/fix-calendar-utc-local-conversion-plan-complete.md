# Plan Complete: Fix calendar UTC/local conversion

This plan reworked client-side datetime handling so UTC event values from the backend are correctly shown as local wall time in calendar editor controls, while saves serialize predictably back to UTC. The implementation removed ambiguous conversion points, hardened serialization boundaries, and added deterministic regressions for the reported +12h drift behavior. Validation confirmed that editor display, payload construction, and broader calendar behaviors remain stable.

**Phases Completed:** 4 of 4

1. ✅ Phase 1: Add UTC-to-local regression tests
2. ✅ Phase 2: Rework editor load/display conversion
3. ✅ Phase 3: Rework save-path conversion to UTC
4. ✅ Phase 4: Validate and harden regression coverage

**All Files Created/Modified:**

- `src/components/DateTimeInputs.tsx`
- `src/pages/SummitCalendar/components/SummitCalendar.tsx`
- `src/pages/SummitCalendar/models/TerrainEventItem.ts`
- `tests/unit/components/date-time-input-contract.spec.ts`
- `tests/unit/components/calendar-editor-payload-shape.spec.ts`
- `plans/fix-calendar-utc-local-conversion-plan.md`
- `plans/fix-calendar-utc-local-conversion-plan-phase-1-complete.md`
- `plans/fix-calendar-utc-local-conversion-plan-phase-2-complete.md`
- `plans/fix-calendar-utc-local-conversion-plan-phase-3-complete.md`
- `plans/fix-calendar-utc-local-conversion-plan-phase-4-complete.md`
- `plans/fix-calendar-utc-local-conversion-plan-complete.md`

**Key Functions/Classes Added:**

- `toDisplayMoment`
- `normalizeEditorDateTime`
- `normalizeBoundaryDateTime`

**Test Coverage:**

- Total tests written: 9
- All tests passing: ✅

**Recommendations for Next Steps:**

- Optionally add a DST boundary regression for timezone transition dates.
- Track and address existing repo lint baseline debt separately from this bugfix stream.
