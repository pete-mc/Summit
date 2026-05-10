# Phase 3 Complete: Surface save failures (create/update) clearly

Phase 3 implemented a normalized save-failure contract for create/update and surfaced failures to users in both a top-level editor error area and inline field validation output. Backend messages are shown verbatim, all messages are displayed, and failed saves keep the editor open with user edits preserved.

## Files created/changed

- `src/pages/SummitCalendar/components/SummitCalendar.tsx`
- `src/services/createNewEvent.ts`
- `src/services/updateEvent.ts`
- `src/services/saveEventResult.ts`
- `src/types/Global.d.ts`
- `src/types/styles.d.ts`
- `tests/unit/components/event-save-failure-visibility.spec.ts`
- `tests/unit/components/summit-calendar-types-contract.spec.ts`
- `tests/unit/services/createNewEvent.spec.ts`
- `tests/unit/services/updateEvent.spec.ts`
- `plans/event-validation-feedback-visibility-plan-phase-3-complete.md`

## Functions created/changed

- Updated `saveActivity` and editor error rendering state in `src/pages/SummitCalendar/components/SummitCalendar.tsx`.
- Added shared normalization helpers/types in `src/services/saveEventResult.ts`.
- Updated create/update service functions to return normalized `SaveEventResult` contracts.

## Tests created/changed

- Added `tests/unit/components/event-save-failure-visibility.spec.ts`
- Added `tests/unit/services/createNewEvent.spec.ts`
- Added `tests/unit/services/updateEvent.spec.ts`
- Updated `tests/unit/components/summit-calendar-types-contract.spec.ts`

## Review Status

APPROVED

## Git Commit Message

fix: surface save failures in event editor

- normalize create and update failure result contracts
- render top-level and inline backend validation messages
- preserve editor state and edits when save fails
