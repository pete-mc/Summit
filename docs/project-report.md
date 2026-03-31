# Summit Project Report

## Executive summary

`Summit` is a Manifest V3 browser extension that augments `terrain.scouts.com.au` with additional reports, calendar tooling, and workflow helpers for Scout leaders. Rather than replacing Terrain, it injects functionality into the existing app and reuses the current user session and API access already available in Terrain.

## Project purpose

The project’s goal is to improve usability and reporting capabilities for leaders working in Terrain. Core value areas include:

- Progress reporting (Milestone, OAS, Peak Award)
- Event and calendar management improvements
- Logbook productivity workflows
- Better visibility of award presentation status

## High-level architecture

### Root-level platform and tooling

- `manifest.json`: Browser extension manifest (MV3), content script and style injection.
- `webpack.config.js`: Build pipeline for TypeScript/Vue/React assets and static copy tasks.
- `package.json`: Dependency and script definitions.
- `tsconfig.json`: TypeScript compilation configuration.

### Runtime source layout (`src/`)

- `index.ts`: Runtime bootstrap; integrates Summit into Terrain’s existing Nuxt/Vuex app context.
- `router/SummitRouter.ts`: Adds Summit routes and menu entries and attaches route-specific enhancements.
- `modules/summitModule.ts`: Vuex module for Summit initialization, state, and settings.
- `pages/`: Main user-facing pages.
- `services/`: Terrain API wrappers.
- `components/`: Cross-cutting injected helpers (logbook, iCal export, presented awards).
- `shared/`, `helpers/`, `types/`: Shared models, utility functions, and typings.
- `styles/`: Global styles and theme assets.

### Documentation and reference assets (`docs/`)

- `docs/API/terrain.json`: OpenAPI-style endpoint descriptions.
- `docs/requests/*`: Request examples and endpoint notes.
- `docs/terrain.scouts.com.au/*`: Captured Terrain frontend snapshot for reference/reverse-engineering context.

## Technology stack

- Extension runtime: **Chrome/Edge Extension (Manifest V3)**
- Frameworks: **Vue 2.7**, **Vuex**, **Vue Router**, with **React 18** embedded for richer report/calendar UI sections
- UI library: **Syncfusion EJ2 React** components (grids, schedule, dialogs, dropdowns)
- Build: **TypeScript + webpack + Babel + vue-loader**
- Supporting libraries: `jquery`, `moment`, `big.js`

## Key functional features

### 1) Menu and routing integration

Summit introduces a dedicated “Terrain | Summit” navigation entry and routed experiences under `/summit/*`, while preserving access to Terrain’s native navigation.

### 2) Milestone Report

Displays incomplete milestone requirements and progress, with export capabilities (print/PDF/Excel).

### 3) OAS Report

Aggregates awarded Outdoor Adventure Skill progress by member, stream, branch, and stage.

### 4) Peak Award Report

Builds a consolidated progress matrix across multiple achievement domains to show current peak award readiness.

### 5) Summit Calendar

Provides a simplified event management interface with create/update/delete workflows and streamlined scheduling actions.

### 6) Display Options

Exposes UI behavior settings (e.g., floating Terrain help button visibility) persisted in local state.

### 7) Logbook productivity tools

Adds copy/export/import-style helpers to reduce repetitive logbook entry effort.

### 8) iCal export

Adds activity export to `.ics` format for use in external personal calendars.

### 9) Presented-award overlays

Augments achievement pages to distinguish between items that are “awarded” and those that have also been “presented.”

## Data and API integration model

Summit relies on Terrain’s active auth/session state and uses fetch-based service wrappers to call existing Terrain endpoints.

Key integration areas include:

- Unit/member achievements
- Unit members and profile data
- Member events and calendars
- Logbook data retrieval and persistence

This architecture keeps Summit client-only and avoids requiring a separate Summit backend.

## Styling and design system

Styling is primarily centralized and global:

- `src/styles/index.css`: Main Terrain-targeted overrides and Summit utility classes.
- `src/styles/fluent.min.css`: Bundled Fluent-style stylesheet loaded by the extension.
- `src/styles/fluent.scss`: Theme source/tokens (including Syncfusion-related theming values).

Most page-level Vue scoped styles are minimal, indicating a deliberate preference for global/shared styling over local component-specific CSS.

## Structural patterns observed

- **Vue shell + React internals pattern:** Vue page components host React roots for data-heavy widgets.
- **Host-app integration pattern:** Direct interaction with Terrain globals, route state, and DOM.
- **Thin service layer pattern:** Service files are mostly focused endpoint wrappers.
- **Client-side data processing pattern:** Reporting and aggregation logic runs in the browser.

## Strengths

- Delivers practical, high-value leader workflows with minimal operational overhead.
- Clear source organization by concern (`pages`, `services`, `components`, `styles`).
- Strong report export support across major report pages.
- Reuses existing Terrain auth and API access for seamless user experience.

## Risks and technical debt

- **Tight coupling to Terrain internals:** Changes in Terrain frontend globals, routes, or DOM can break Summit features.
- **Mixed-framework complexity:** Vue + React + direct DOM mutation increases maintenance burden.
- **DOM-hook fragility:** Selector/XPath-based enhancements are sensitive to upstream markup changes.
- **Partially surfaced capabilities:** Some existing feature code appears not fully routed/exposed.
  - `src/pages/PresentAwards/` contains a complete feature flow, but route/menu wiring is commented out in `src/router/SummitRouter.ts`, so it is not discoverable in normal navigation.
  - `src/pages/SectionSummary/` exists in the codebase but does not appear to be surfaced in the main Summit menu/routes alongside core pages like `MilestoneReport`, `OasReport`, and `PeakAward`.
- **Repository noise:** Captured Terrain snapshot under `docs/terrain.scouts.com.au/` adds bulk and can reduce navigability.

## Suggested next steps

1. Formalize integration boundaries (reduce direct DOM dependence where possible).
2. Standardize page implementation strategy (document Vue/React interaction conventions).
3. Add resilience checks around host-app assumptions (`window.$nuxt`, route availability, selector existence).
4. Consider organizing large reference snapshots into archival folders with clear maintenance policy.

## Conclusion

`Summit` is a strong, practical extension-oriented enhancement suite for Terrain. It succeeds by integrating directly into existing user workflows and data, with particularly strong value in reporting and event management. Long-term maintainability will improve most by reducing host-coupling risk and codifying cross-framework patterns.
