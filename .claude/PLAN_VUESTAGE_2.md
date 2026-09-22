<!-- @format -->

# VueStage 2 — Heat-Map Visual Layout

See [PLAN_VUE.md](PLAN_VUE.md) for context (including current approval status —
**still DRAFT as of writing**) and [PLAN_VUESTAGE_1.md](PLAN_VUESTAGE_1.md) for the
mount pattern and naive render this stage replaces. Depends on VueStage 1 being
complete.

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

- [ ] `OASHeatMapVue.vue` renders the full grouped heat-map structure from real
      `groupRowsForHeatMap` output, correctly showing awarded/answered/unanswered
      states.
- [ ] Skill icons render (reusing `getSkillIconUrl.ts` unchanged).
- [ ] Visual baseline reasonably matches the existing React heat-map's information
      density and color coding (not pixel-identical — real Vuetify styling is
      expected to look different, that's the point).
- [ ] No sticky-header attempt; horizontal scroll works for wide tables.
- [ ] New tests pass; `npm test` shows no regressions.
- [ ] `npm run build` succeeds; `npx tsc --noEmit` shows no new errors.
- [ ] Manual verification: unpacked extension in Edge, heat-map renders correctly
      against real live unit data, compared side-by-side with the existing React page
      at its original route.
