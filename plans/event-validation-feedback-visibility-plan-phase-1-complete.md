# Phase 1 Complete: Reproduce and codify missing inline errors

Phase 1 added explicit contract tests that prove three validation keys are not surfaced inline today. The tests intentionally fail for the right reasons and establish a clean baseline for Phase 2 production fixes.

## Files created/changed

- `tests/unit/components/event-editor-inline-validation-contract.spec.ts`
- `plans/event-validation-feedback-visibility-plan-phase-1-complete.md`

## Functions created/changed

- Added test cases within `describe("Phase 1 event editor inline validation visibility gaps", ...)` in `tests/unit/components/event-editor-inline-validation-contract.spec.ts`.

## Tests created/changed

- `renders an inline validation contract for scout_method_elements`
- `renders an inline validation contract for organisers`
- `renders an inline validation contract for member_roles near member assignment controls`

## Review Status

APPROVED

## Git Commit Message

test: codify missing inline validation contracts

- add failing contract tests for scout_method_elements
- add failing contract tests for organisers and member_roles
- keep phase scoped to tests with no production changes
