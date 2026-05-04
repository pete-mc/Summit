# Plan: SIA Import Export

This plan adds per-project export and create-only import for Special Interest Area projects on the Terrain `/sia` page through Summit UI augmentation. It prioritizes stable DOM anchoring, portable export payloads, and robust validation with tests-first implementation.

## Phases (4)

1. **Phase 1: Inject per-card export buttons on `/sia`**
    - **Objective:** Add one Summit Export action per rendered SIA project card adjacent to existing View/Edit/Review actions.
    - **Files/Functions to Modify/Create:** `src/router/SummitRouter.ts`, `src/components/index.ts`, create `src/components/siaTransfer.ts`.
    - **Tests to Write:** `tests/unit/components/siaTransfer.spec.ts` (injection + dedupe + placement near existing action).
    - **Steps:**
        1. Write failing tests for per-card button injection and deduplication on rerender.
        2. Add `/sia` route hook and initialize transfer UI logic.
        3. Implement stable action-area anchoring and class/data-v mirroring.
        4. Run tests and refine until pass.

2. **Phase 2: Implement project export payload and download**
    - **Objective:** Export each SIA project as JSON from per-card button click.
    - **Files/Functions to Modify/Create:** `src/components/siaTransfer.ts`, optional `src/types/terrainTypes.d.ts` additions.
    - **Tests to Write:** `tests/unit/components/siaTransfer.spec.ts` (export click, payload shape, filename behavior).
    - **Steps:**
        1. Write failing tests for export click -> download behavior.
        2. Implement export contract (`summit-sia-v1`) with create-portable fields.
        3. Exclude uploads and volatile identifiers from export payload.
        4. Run tests and fix failures.

3. **Phase 3: Add create-only import from JSON**
    - **Objective:** Add global Import action on `/sia` to create new draft SIA projects from exported JSON.
    - **Files/Functions to Modify/Create:** `src/components/siaTransfer.ts`, create `src/services/createMemberAchievement.ts`, update `src/services/index.ts`.
    - **Tests to Write:** `tests/unit/components/siaTransfer.spec.ts`, `tests/unit/services/createMemberAchievement.spec.ts`.
    - **Steps:**
        1. Write failing tests for import file parsing/validation and create-only save calls.
        2. Implement hidden file picker, parse/validate workflow, and create API call.
        3. Ensure imports ignore/exclude uploads and provide user feedback on errors.
        4. Run tests and fix until pass.

4. **Phase 4: Hardening, docs, and regression checks**
    - **Objective:** Finalize reliability and documentation for the new SIA transfer capability.
    - **Files/Functions to Modify/Create:** update docs under `docs/API/` or feature docs, add tests if needed.
    - **Tests to Write:** update/add targeted tests for edge cases (invalid JSON, malformed contract, duplicate init guards).
    - **Steps:**
        1. Write failing tests for edge/error paths not covered in prior phases.
        2. Implement validation and UX hardening improvements.
        3. Add concise docs describing export/import contract and constraints.
        4. Run full test suite and resolve regressions.

## Open Questions (0)

- Decisions locked:
  - Import mode: create-only.
  - Upload handling: excluded for now.
  - Export placement: per-card next to View/Edit/Review.
