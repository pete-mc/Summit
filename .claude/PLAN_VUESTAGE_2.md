<!-- @format -->

# VueStage 2 — Heat-Map Visual Layout

## Status: COMPLETE (pending live browser re-verification)

See [PLAN_VUE.md](PLAN_VUE.md) for context and [PLAN_VUESTAGE_1.md](PLAN_VUESTAGE_1.md)
for the mount pattern and naive render this stage replaces.

**Deviation from the original plan text**: the "Component test via `@vue/test-utils`"
idea was not used, same reason as VueStage 1 (no `.vue` Jest transform installed).
`OASHeatMapVue`'s logic lives in `OASHeatMapVue.ts` as a `defineComponent` options
object with all the row-grouping/filtering/cell-state logic in `computed` properties
— since Vue 2 options objects are plain JS/TS, this can be instantiated directly with
`new Vue.extend(options)(...)` in Jest (no template/DOM needed) to test the computed
output. See `tests/unit/components/oas-heatmap-vue-render-contract.spec.ts`. This also
surfaced a real gap worth noting for later stages: once `OasProgressionVueContent.ts`
imports a `.vue` file (`OASHeatMapVue.vue`) in its own import chain, it can no longer
be `require()`d directly in Jest at all (not just template-tested) — vue-loader only
merges an SFC's external script with its template at webpack build time, so Jest hits
a raw `<template>` parse error. VueStage 1's own render-contract test had to be
rewritten to stop importing `OasProgressionVueContent` live and check its wiring via
source-text assertions instead (matching the router test's style) — any future test
that needs the actual `OasProgressionVueContent` (or `OasProgressionVue`) runtime
behavior will need the same treatment, or real `@vue/test-utils`/`vue-jest` Jest
infrastructure added (a bigger decision, not taken lightly mid-build).

## Goal

Replace VueStage 1's naive flat list with the real heat-map visual layout — a table
grouped by skill/stream section, with member rows and color-coded stage/i-statement
cells — matching the existing React page's look as the baseline, adapted to Vuetify
components and conventions where it makes sense rather than a pixel-identical port.
**Confirmed with user: loose adaptation using natural Vuetify/Material Design
styling is the target, not pixel-identical.**

## Data shape (unchanged — reused directly)

`groupRowsForHeatMap.ts` already produces exactly the tree structure needed:
`HeatMapSection[]` → each with `members: SectionMemberRow[]` → each with
`stages: HeatMapStage[]` → each with `cells: HeatMapCell[]`. This stage is purely
about **rendering** that existing structure in a Vue template — no new data
transformation logic, reuse `groupRowsForHeatMap`, `sliceStagesToRange`,
`filterMembersByPatrol`, `groupMembersByPatrol`, `formatStageProgress`, `sortMembers`
from `filterHeatMapSections.ts` exactly as the React version does.

## Layout, adapted to Vuetify

Reference the existing React implementation (`OASHeatMap.tsx`) for the exact visual
target (section title row with skill icon, member rows, per-stage cell groups, the
solid awarded-bar vs. individual answered/unanswered squares distinction) — but this
stage should use real Vuetify primitives where they fit naturally, not force a
literal `<table>` if Vuetify's own patterns serve better:

- **`v-simple-table`** (Vuetify 2's lightweight table wrapper) is likely the right
  base — it's a thin styled wrapper around a plain `<table>`, so the existing
  `<thead>`/`<tbody>`/row-grouping structure ports over directly with Vuetify's
  visual treatment applied, rather than needing a heavier `v-data-table` (out of
  scope per [PLAN_VUE.md](PLAN_VUE.md) — no built-in grouping/pagination needed here
  since the existing page doesn't paginate either).
- Section title rows: keep the existing skill icon (`getSkillIconUrl.ts`, reused
  as-is) + title text pattern; a `v-card` or plain styled row is fine — this is a
  judgment call, not a fixed requirement.
- Stage/cell squares: reuse the same visual language as the existing CSS
  (`--summit-color-status-unanswered`/`-answered`/`-awarded` tokens from
  `src/styles/index.css` — these are plain CSS custom properties, framework-agnostic,
  safe to reuse directly in the new Vue SFC's `<style>` block) rather than inventing
  new colors. A solid awarded bar vs. individual small squares for in-progress
  stages, matching the existing page's behavior.
- **Do not attempt `position: sticky` for the header row** — the original build
  tried and explicitly abandoned this (see [PLAN_VUE.md](PLAN_VUE.md)'s "known
  gotchas" — Terrain's fixed 80px app bar makes sticky positioning unreliable). Plain
  non-sticky header, full natural page height, horizontal scroll only for wide
  tables (`overflow-x: auto` on the table's wrapper).

## New files

`src/pages/OasProgressionVue/components/`:

- **`OASHeatMapVue.vue`** — the real heat-map component, replacing VueStage 1's
  naive list inside `OasProgressionVueContent.vue`. Props mirror `OASHeatMapProps`
  from the React version (`items`, `trunkStageCounts`, `members`, `visibleStreams`,
  `stageRange`, `sortBy`, etc.) — but only the props actually needed by this stage
  (`showEmptySections`, `hideLastName`, `useCodenames`, `selectedPatrols`,
  `breakByPatrol` etc. can be added in VueStage 3 alongside their controls, to avoid
  building unused prop plumbing early).

`OasProgressionVueContent.vue` (from VueStage 1) is updated to render
`<OASHeatMapVue>` instead of the naive list, passing through the same data it
already fetches.

## Tests

- Component test (via `@vue/test-utils`, mounting `OASHeatMapVue.vue` with fixture
  `HeatMapSection[]` data) proving: sections render with correct titles/icons, member
  rows render, stage cells show the correct awarded/answered/unanswered visual state
  (assert on the CSS class/color token applied, matching the existing
  `oas-heatmap-render-contract.spec.ts`'s assertion style if that file's approach is
  reusable — check before inventing a new one), empty sections render or hide
  correctly per `showEmptySections`.

## Acceptance criteria

- [x] `OASHeatMapVue.vue` renders the full grouped heat-map structure from real
      `groupRowsForHeatMap` output, correctly showing awarded/answered/unanswered
      states — verified via `oas-heatmap-vue-render-contract.spec.ts`'s 5 tests
      (grouping, stream filtering, cell states, complete-stage bar, stage-range
      slicing). Live browser re-check still pending (see below).
- [x] Skill icons render (reusing `getSkillIconUrl.ts` unchanged, imported directly,
      no changes made to that file).
- [ ] Visual baseline reasonably matches the existing React heat-map's information
      density and color coding — reuses the exact same global CSS classes
      (`oas-heatmap-*`) the React page's `src/styles/index.css` already defines, so
      this should hold, but needs a live side-by-side look to confirm.
- [x] No sticky-header attempt; horizontal scroll works for wide tables — template
      uses the same `.oas-heatmap-scroll`/`.oas-heatmap-table` classes as the React
      version, which already implement this via `overflow-x: auto`.
- [x] New tests pass; `npm test` shows no regressions (357/358 passing, same single
      pre-existing UNC-path failure; 5 new tests + VueStage 1's tests all pass).
- [x] `npm run build` succeeds; `npx tsc --noEmit` shows no new errors beyond the 4
      known pre-existing ones.
- [ ] Manual verification: unpacked extension in Edge, heat-map renders correctly
      against real live unit data, compared side-by-side with the existing React page
      at its original route.
