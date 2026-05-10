# Phase 2 Complete: Enforce create-time defaults in SummitCalendar

Implemented create-time enforcement in `SummitCalendar` so new events always use unit ownership and current-user organiser defaults, even when a saved draft exists. The create path now resolves ownership from the latest active profile at action time.

**Files created/changed:**

- plans/enforce-event-owner-organiser-plan-phase-2-complete.md
- src/pages/SummitCalendar/components/SummitCalendar.tsx

**Functions created/changed:**

- `getCreateOwnershipDefaults` (new)
- `buildEditorDefaults` (updated)
- `newActivity` (updated)

**Tests created/changed:**

- Existing Phase 1 tests in `tests/unit/components/calendar-editor-payload-shape.spec.ts` now pass against create-time enforcement behavior.

**Review Status:** APPROVED

**Git Commit Message:**
feat: enforce create defaults for summit events

- resolve owner fields from latest active profile on create
- seed organisers with the current member as first and only default
- reapply enforced defaults after draft merge to prevent overrides
