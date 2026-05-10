# Plan: Enforce unit owner and organiser defaults

Ensure all newly created events are always owned by the active unit and created with the current member as the organiser by default. The implementation applies defense-in-depth in both editor draft assembly and payload serialization, while preserving the existing API contract and verifying behavior with focused tests.

## Phases 4

1. **Phase 1: Add failing tests for create defaults**
    - **Objective:** Capture failing behavior for owner and organiser defaults in event creation flow.
    - **Files/Functions to Modify/Create:** `tests/unit/components/calendar-editor-payload-shape.spec.ts`, `tests/unit/components/calendar-event-crud.spec.ts` (or nearest create-flow tests)
    - **Tests to Write:**
        - New event draft uses `owner_type: "unit"`
        - New event draft uses active profile `owner_id`
        - New event draft seeds organisers with current member only
    - **Steps:**
        1. Write tests first for draft defaults and create payload expectations.
        2. Run targeted test suite and confirm red state.
        3. Document failures for implementation handoff.

2. **Phase 2: Enforce create-time defaults in SummitCalendar**
    - **Objective:** Make create flow always set owner and organiser defaults even when a saved draft exists.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`buildEditorDefaults`, `newActivity`)
    - **Tests to Write:**
        - Saved draft cannot override enforced `owner_type` and `owner_id`
        - Saved draft cannot remove initial current-member organiser default
        - New activity resolves unit/member from latest active profile at creation time
    - **Steps:**
        1. Add failing tests for draft merge and profile-switch timing.
        2. Implement minimal create-time enforcement after merge.
        3. Run targeted tests and confirm green.

3. **Phase 3: Enforce serializer-level payload integrity**
    - **Objective:** Guarantee outbound payload preserves `unit` owner contract and organiser IDs.
    - **Files/Functions to Modify/Create:** `src/pages/SummitCalendar/models/TerrainEventItem.ts`
    - **Tests to Write:**
        - Serializer emits `event_type.type = "unit"`
        - Serializer emits `event_type.id` from latest active unit
        - Serializer emits organisers as string IDs with current member as default when missing
    - **Steps:**
        1. Add serializer tests first and confirm failures.
        2. Implement minimal payload-level enforcement.
        3. Re-run serializer/payload tests and confirm pass.

4. **Phase 4: Regression verification and completion**
    - **Objective:** Validate no regressions in related calendar create/edit and validation behavior.
    - **Files/Functions to Modify/Create:** existing unit test suites only as needed
    - **Tests to Write:** none unless regression gaps are discovered
    - **Steps:**
        1. Run impacted suites (CRUD, validation, grouped multiselect, payload shape).
        2. Fix any regressions with minimal changes and re-run tests.
        3. Confirm all targeted tests pass.

## Open Questions 0 (resolved by user)

1. Default organiser behavior: first and only current user.
2. Contract behavior: preserve existing API contract fields.
3. Profile behavior: use latest active profile/unit at creation time.
