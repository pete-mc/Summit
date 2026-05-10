# Phase 1 Complete: Add failing tests for create defaults

Added targeted red tests that capture the ownership and organiser default gaps in Summit calendar event creation. These tests now fail for the expected reasons and provide a clear guardrail for implementation in subsequent phases.

**Files created/changed:**

- plans/enforce-event-owner-organiser-plan.md
- plans/enforce-event-owner-organiser-plan-phase-1-complete.md
- tests/unit/components/calendar-editor-payload-shape.spec.ts

**Functions created/changed:**

- Test setup helpers in `calendar-editor-payload-shape.spec.ts` for active-profile and draft-driven create flow assertions.

**Tests created/changed:**

- enforces unit owner and current-member organiser defaults for new activity using latest active profile
- does not allow saved draft owner or organiser fields to override create defaults

**Review Status:** APPROVED with minor recommendations

**Git Commit Message:**
test: add failing tests for event ownership defaults

- add red tests for owner_type and owner_id create defaults
- add red test coverage for organiser default current member
- verify failures target current create-flow gaps
