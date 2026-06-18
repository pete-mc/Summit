# Plan: Summit Terrain Integration Docs

This plan creates internal-first but future-public-ready documentation for all Summit interactions with Terrain services, plus an expanded API specification and sequence diagrams. It converts implementation-coupled knowledge into a maintainable contract baseline that can evolve into a public integration API.

## Phases (5)

1. **Phase 1: Build Interaction Inventory**
    - **Objective:** Create a canonical inventory of all runtime Terrain interactions used by Summit.
    - **Files/Functions to Modify/Create:** `docs/API/summit-terrain-interaction-inventory.md`; references from `src/services/*`, `src/router/SummitRouter.ts`, `src/modules/summitModule.ts`, `src/summitloader.js`, `manifest.json`.
    - **Tests to Write:** `tests/docs/interaction-inventory-links.test.ts`, `tests/docs/interaction-inventory-hostnames.test.ts`.
    - **Steps:**
        1. Write tests that fail when required inventory sections or source references are missing.
        2. Document all endpoint interactions with trigger, auth, input, output, and side effects.
        3. Run tests and refine inventory until all pass.

2. **Phase 2: Document Control Flows with Sequence Diagrams**
    - **Objective:** Capture end-to-end feature flows and how user actions trigger Terrain API calls.
    - **Files/Functions to Modify/Create:** `docs/API/summit-terrain-control-flows.md` with Mermaid sequence diagrams.
    - **Tests to Write:** `tests/docs/control-flow-coverage.test.ts`, `tests/docs/control-flow-consistency.test.ts`.
    - **Steps:**
        1. Write tests requiring flow coverage for initialization, awards, calendar CRUD, logbook copy/paste, and iCal export.
        2. Add flow narratives and sequence diagrams mapped to runtime symbols.
        3. Run tests and fix flow-to-inventory mismatches.

3. **Phase 3: Design Summit Integration API v0 (Future Public Contract)**
    - **Objective:** Define a stable v0 contract for Summit-mediated integrations, internal-first and public-ready.
    - **Files/Functions to Modify/Create:** `docs/API/summit-integration-api-v0.md`; expand `docs/API/terrain.json`.
    - **Tests to Write:** `tests/docs/api-v0-contract-shape.test.ts`, `tests/docs/api-v0-endpoint-parity.test.ts`.
    - **Steps:**
        1. Write tests validating required contract sections and parity with discovered interactions.
        2. Define domain grouped operations, DTOs, versioning, and compatibility policy.
        3. Expand `terrain.json` to include major used resources and error conventions.

4. **Phase 4: Standardize Auth, Error, and Observability Conventions**
    - **Objective:** Establish conventions suitable for reliable external integrations.
    - **Files/Functions to Modify/Create:** `docs/API/summit-error-conventions.md`; updates in `docs/API/summit-integration-api-v0.md`.
    - **Tests to Write:** `tests/docs/error-conventions-required-fields.test.ts`, `tests/docs/auth-observability-sections.test.ts`.
    - **Steps:**
        1. Write tests requiring normalized auth/error/telemetry sections.
        2. Document token-provider abstraction, retryability model, timeout guidance, and redaction rules.
        3. Run tests and ensure wording is consistent with API v0 design.

5. **Phase 5: Finalize Expanded API Docs and Request Examples**
    - **Objective:** Deliver an immediately usable API-doc baseline with concrete examples.
    - **Files/Functions to Modify/Create:** `docs/requests/requests.ts`; `docs/requests/*.rest`; doc index links.
    - **Tests to Write:** `tests/docs/request-examples-coverage.test.ts`, `tests/docs/cross-reference-integrity.test.ts`.
    - **Steps:**
        1. Write tests that fail when key operations are missing request examples.
        2. Add/refresh examples for events CRUD, calendars, logbook, profiles, and achievements filters.
        3. Run tests and finalize cross-link integrity.

## Open Questions (0)

- No open questions. Decisions locked:
  - Audience: internal first.
  - API artifact: expanded.
  - Contract intent: future public.
  - Migration guide: not in scope.
  - Sequence diagrams: included.
