<!-- @format -->

# VueStage 3 — Filters and Display Features

## Status: COMPLETE (pending live browser verification)

See [PLAN_VUE.md](PLAN_VUE.md) for context and [PLAN_VUESTAGE_2.md](PLAN_VUESTAGE_2.md)
for the heat-map component these filters control.

**Deviation from the original plan text**: the "Component tests via `@vue/test-utils`"
and "Integration-level test... mount the full `OasProgressionVueContent.vue` tree"
ideas were not used — same reason as every prior stage (no `.vue` Jest transform
installed; see PLAN_VUESTAGE_1.md's "Deviations" note). `OASProgressionFiltersVue`'s
gating/wiring rules are verified via source-text assertions
(`oas-progression-filters-vue-render-contract.spec.ts`), and the filter-state →
heat-map wiring is verified the same way in
`oas-progression-vue-render-contract.spec.ts` (checking `OasProgressionVueContent.vue`
passes each `filters.*` field through to `OASHeatMapVue`'s props by name). The
persistence round-trip test WAS written exactly as originally planned
(`OASProgressionVueFilterPersistence.spec.ts`), since that file has no `.vue`
dependency and works like any other plain-TS service test.

One open question flagged for live verification: `OASProgressionFiltersVue.vue` uses
`mdi-magnify`/`mdi-refresh` icon classes, relying on Terrain's own already-loaded MDI
webfont (per `.claude/DESIGN.md`) rather than installing a separate `@mdi/font`
package — this is a reasonable bet (Vuetify 2's default icon preset is `'mdi'`, and
DESIGN.md confirms Terrain's page already loads `materialdesignicons-webfont`
globally) but has NOT been confirmed to actually render correctly in a live page load.

## Goal

Port the existing page's filter/display feature set (per the original
`.claude/PLAN_STAGE_4.md` and its many post-review refinement rounds — read that
file's full history before starting, it documents real UX decisions already made and
tested with the user, not just the initial build) using real Vuetify form controls
instead of hand-rolled equivalents. This is the stage where using Vuetify should
start actually paying off — its built-in `v-select`, `v-text-field`,
`v-checkbox`/`v-switch`, `v-chip` components replace the custom `DropdownMultiSelect`,
plain `<input>`/`<select>`, and manual outside-click-handling code the React version
had to build by hand.

## Features to port (same set as the original, adapted to Vuetify controls)

- **Member search** — `v-text-field` with a search icon (`prepend-inner-icon="mdi-magnify"`
  — Terrain's own MDI icon font is available since this Vue instance shares Terrain's
  page-level CSS/fonts, per `.claude/DESIGN.md`) instead of the hand-built SVG+input
  combo.
- **Skills multi-select** — `v-select` with `multiple chips deletable-chips`, exactly
  the pattern already proven working in a prior session's spike. Reuse `OAS_SKILLS`
  from `filterHeatMapSections.ts`.
- **Patrol multi-select** — same `v-select multiple chips` pattern, only shown when
  `collectPatrolNames(...)` returns a non-empty list (same gating logic as the
  existing page).
- **Stage range** — two `v-select`s (1-9) for min/max, matching the existing page's
  already-established UI choice (a slider was considered and rejected originally —
  don't reopen that, see `.claude/PLAN_STAGE_4.md`).
- **Sort by** — `v-select` with the same three options (`firstName`, `lastName`,
  `stageProgress`), reusing `sortMembers` from `filterHeatMapSections.ts`.
- **Display toggles group** — `v-checkbox` (or `v-switch`, pick whichever reads
  better in Vuetify's visual language — a judgment call) for: Use codenames, Hide
  last name (disabled when codenames is active — same interaction rule as the
  original), Break by patrol (gated same as Patrol filter), Hide empty streams
  (gated on `hasAnyEmptySections`), Hide empty top columns, Only show in-progress.
- **Reset filters** — a `v-btn`, restores `DEFAULT_FILTERS` while preserving
  `viewMode` if a view-mode concept exists in the Vue version (it doesn't yet, since
  VueStage rebuild is heat-map-only — simplify accordingly, no view-mode field
  needed unless VueStage 4 or later adds the Table view back).

## Filter state and persistence

Reuse the same `OASProgressionFilterState` shape from
`OASProgressionFilterPersistence.ts` where it fits (minus `viewMode`, not applicable
here) — either import that file directly if its shape needs no changes, or fork a
`OASProgressionVueFilterPersistence.ts` under the new page's own `services/` folder
if the Vue version's fields genuinely diverge. Use a **separate localStorage key**
(e.g. `summit.oasProgressionVue.filters`) regardless — the two pages should not share
saved filter state, since they're independent experiments a user might configure
differently.

## Where filter state lives

Since VueStage 1 established one mount point for the whole page
(`OasProgressionVueContent.vue`), filter state can live as ordinary Vue `data()` on
that root component, passed down to child components (`OASHeatMapVue.vue`, a new
filter-bar component) via normal props, with events/`v-model` flowing changes back
up — no cross-framework wiring needed anywhere in this stage, unlike the earlier
single-control spike. This is the concrete payoff of building the whole page as one
Vue tree from VueStage 1, rather than one island at a time.

## New files

`src/pages/OasProgressionVue/components/`:

- **`OASProgressionFiltersVue.vue`** — the filter bar, containing all controls
  listed above, emitting filter-state changes up to `OasProgressionVueContent.vue`
  (or owning the state itself and having `OasProgressionVueContent.vue` read it via
  `ref`/`v-model` — pick whichever is more idiomatic Vue 2, both are fine).

`src/pages/OasProgressionVue/services/` (only if the persistence shape diverges from
the existing `OASProgressionFilterPersistence.ts` — see above):

- **`OASProgressionVueFilterPersistence.ts`**

## Tests

- Component tests (via `@vue/test-utils`) for `OASProgressionFiltersVue.vue`: each
  control changes emitted/bound state correctly, gating logic (Patrol/Break-by-patrol
  only shown when patrols exist, Hide-last-name disabled when codenames active, Hide
  empty streams only shown when relevant) matches the original page's behavior.
- Integration-level test confirming `OASHeatMapVue.vue` actually re-filters when
  `OASProgressionFiltersVue.vue`'s state changes (mount the full
  `OasProgressionVueContent.vue` tree, not just the filter bar in isolation).
- Persistence round-trip test, same style as `OASProgressionFilterPersistence.spec.ts`.

## Acceptance criteria

- [x] All filters/toggles listed above implemented with real Vuetify controls
      (`v-text-field`, `v-select` ×4, `v-checkbox` ×6, `v-btn`).
- [x] Filter state persists to localStorage (separate key
      `summit.oasProgressionVue.filters`, confirmed distinct from the React page's
      `summit.oasProgression.filters`) and restores on reload — verified by
      `OASProgressionVueFilterPersistence.spec.ts`'s 7 tests.
- [x] All gating/interaction rules from the original page ported correctly (codenames
      supersedes hide-last-name, patrol controls only shown when patrols exist, hide
      empty streams only shown when relevant) — verified via source-text assertions
      in `oas-progression-filters-vue-render-contract.spec.ts`.
- [x] Reset filters works — `OASProgressionFiltersVue` emits `reset`,
      `OasProgressionVueContent.onResetFilters` restores `DEFAULT_FILTERS`.
- [x] New tests pass; `npm test` shows no regressions (376/377 passing, same single
      pre-existing UNC-path failure; 29 new/updated tests across 4 files all pass).
- [x] `npm run build` succeeds; `npx tsc --noEmit` shows no new errors beyond the 4
      known pre-existing ones.
- [x] Manual verification: unpacked extension in Edge, every filter tested
      individually and in combination against real live unit data. Confirmed live by
      the user 2026-09-22/23 ("All filters working"), including `mdi-*` icons
      rendering correctly (resolving the open question above — Terrain's own MDI
      webfont bet paid off, no separate `@mdi/font` package needed).

## Post-verification polish (from live review)

Two layout issues found and fixed after the above verification (commit `4d7ac52`):
- The Skills/Patrol `v-select`s rendered their `chips` inside the cramped select box
  itself, wrapping awkwardly. Switched to a compact "N selected" summary inside the
  select, with the actually-selected Skills shown as deletable `v-chip`s in their own
  row below the filter controls, above "Display" — per the user's suggested layout.
- The Stage range fields used the React page's own `.oas-heatmap-filter-label` CSS
  class as a plain `<label>`, visually inconsistent with every other field's native
  Vuetify floating label. Replaced with two proper `v-select`s ("Stage from"/"Stage
  to"), matching the rest of the filter bar's look.
