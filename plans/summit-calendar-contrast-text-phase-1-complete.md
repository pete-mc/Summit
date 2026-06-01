# Phase 1 Complete: Add failing tests for contrast-aware color selection

Added test-first contracts that define contrast-aware event text behavior and strict `#scheduler` scoping, with expected red-state failures due to missing implementation.

## Files created/changed

- tests/unit/helpers/SummitCalendarContrastText.spec.ts
- tests/unit/components/calendar-event-text-color-contract.spec.ts
- tests/browser/calendar-event-text-color-scoping.spec.ts

## Functions created/changed

- `describe("Phase 1 summit calendar contrast text helper contract", ...)`
- `describe("Phase 1 calendar event text color contract", ...)`
- `test("applies contrast-aware colors inside #scheduler ...", ...)`

## Tests created/changed

- `tests/unit/helpers/SummitCalendarContrastText.spec.ts`
- `tests/unit/components/calendar-event-text-color-contract.spec.ts`
- `tests/browser/calendar-event-text-color-scoping.spec.ts`

## Review Status

APPROVED

## Git Commit Message

test: add contrast-aware calendar text contracts

- Add helper unit contracts for dark/light color outcomes
- Add strict calendar mapping contract for computed textColor
- Add browser scoping contract for #scheduler-only styling
