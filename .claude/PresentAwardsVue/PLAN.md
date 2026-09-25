# Present Awards (Vue) — overview plan

**Status:** approved 2026-09-26. Build proceeds stage by stage.

## Context

`Present Awards` (`/summit/tools/PresentAwards`) is one of the last React-in-Vue hybrid pages
in Summit: a Vue SFC shell that manually mounts a React 18 root, which renders
`components/PresentAwards.tsx` on top of the generic `src/components/DataGrid.tsx`.

The OAS Progression page has since been rebuilt as a pure Vue 2.7 + Vuetify 2 page
(`src/pages/OasProgressionVue/`), and its **Table view** (`OASProgressionTableVue`) is now the
house style for a data table: a `v-data-table` with a per-column filter row, dropdown filters for
low-cardinality columns, Clear-filters, filter-aware Excel/PDF export, and a pill-button header
row. A second page (`src/pages/IStatements/`) has already proved the pattern is repeatable.

The user wants Present Awards brought up to that same style and feature set, written against the
new Vue standard rather than React — built as a **new replica page alongside the existing one**,
exactly as `OasProgressionVue` was built alongside the React `OasProgression`.

**Intended outcome:** a `/summit/tools/presentawards-vue` page that renders the same award data,
supports the same save-to-hidden-calendar-event workflow, and gains the OAS table's filtering,
export and persistence — with the React page left untouched for side-by-side comparison on live
unit data.

## Decisions confirmed with the user (2026-09-25)

| Question | Decision |
|---|---|
| Interactive cells | **Vuetify native** — `v-simple-checkbox` for Present, `v-menu` + `v-date-picker` for the Presented date. No React components on the new page. |
| Features to carry across | **All four** — per-column filter row + Clear filters, Excel + PDF export over filtered rows, Refresh button, saved filter state in localStorage. |
| Existing React page | **Keep both.** New route + new nav entry; React page untouched. Archiving/promotion is a separate later decision, mirroring how OAS Progression was eventually promoted. |

## Scope

**Reused as-is — no behaviour changes** (mirrors PLAN_VUE.md's "only the rendering layer is new"):

- `src/pages/PresentAwards/models/SummitAchievement.ts` — the row view-model, already covered by
  `tests/unit/models/SummitAchievement.spec.ts`
- The data-fetch orchestration in `PresentAwards.ts` (`getAwardData`) and the save pipeline
  (`handleUpdate`) — **extracted verbatim into a shared service** so both pages call one copy
  rather than the logic being duplicated (see Stage 1)
- `src/services/*` — `fetchMemberEvents`, `fetchActivity`, `fetchUnitAchievementsFilterd`,
  `fetchUnitMembers`, `updateEvent`, `createNewEvent`
- `src/helpers/CompressGuids.ts`, `src/helpers/TerrainState.ts`, `src/helpers/Logger.ts`
- `src/components/gridExport.ts` — `exportGridToExcel`, `exportGridToPdf`
- `src/vuetifySetup.ts` — already global, already in `sideEffects`, no change

**New:**

```
src/pages/PresentAwardsVue/
  PresentAwardsVue.vue            shell rendered by Terrain's Vue
  PresentAwardsVue.ts             data load, save, second-Vue-instance mount, breadcrumbs
  components/
    PresentAwardsVueContent.vue   <v-app> root, .oas-vue-content scale, header button row, state
    PresentAwardsVueContent.ts
    PresentAwardsTableVue.vue     the v-data-table replica
    PresentAwardsTableVue.ts
  services/
    PresentAwardsVueFilterPersistence.ts    localStorage: summit.presentAwardsVue.filters
```

Plus a shared extraction from the React page:

```
src/pages/PresentAwards/services/
  awardStorageEvent.ts            loadPresentedAwards() / buildStorageEventPayload() / savePresentedAwards()
```

**Out of scope** (explicitly, unless the user asks):

- The `DEV_NOTES.md` wishes — grouping by member, a "Badger" badge icon, and a save checksum to
  stop concurrent leaders clobbering each other. `DEV_NOTES.md` is marked developer-only and the
  AI is not to act on it unprompted. The concurrent-save limitation is **carried forward as-is**;
  this build must not make it worse, but does not fix it.
- Any change to the React page's rendering or route.
- Playwright coverage — consistent with the OAS Vue pages, verification is manual against the
  live site plus Jest unit tests.

## Stages

| Stage | File | Outcome |
|---|---|---|
| 1 | `PLAN_STAGE_1.md` | Extract the storage-event service; scaffold page/route/nav/breadcrumbs; naive `v-data-table` renders real rows |
| 2 | `PLAN_STAGE_2.md` | Interactive cells — `v-simple-checkbox` + `v-menu`/`v-date-picker`, Save Changes, save feedback |
| 3 | `PLAN_STAGE_3.md` | Per-column filter row, Clear filters, Show/Hide Previously Presented |
| 4 | `PLAN_STAGE_4.md` | Excel/PDF export over filtered rows, Refresh, filter persistence |
| 5 | `PLAN_STAGE_5.md` | Polish, CSS mechanics, tests, live verification |

Each stage ends at a state that builds and is loadable in Edge, so the user can look at it before
the next stage starts.

## Standing verification baseline (every stage)

- `npm run build` succeeds
- `npx tsc --noEmit` — no **new** errors (4 known pre-existing, one of them in
  `PresentAwards.tsx` itself)
- `npm test` — no regressions; the single UNC-path failure in
  `tests/unit/smoke/lint_stack_loads.spec.ts` is expected on this network drive
- `npm run lint` — ~40 pre-existing upstream errors; don't fix them here, don't add to them
- Manual: load `dist/` unpacked in Edge against real live unit data

## Key references

- `.claude/OASProgression/PLAN_VUE.md` — why the second Vue instance is required
- `.claude/OASProgression/PLAN_VUESTAGE_5.md` — the Table view build, including the three CSS
  mechanics (`::v-deep`, the two 20px global overrides, the `#body.prepend` hover leak)
- `.claude/I_Statement/PLAN_STAGE_2.md` — the "second time we did this" page recipe
- `.claude/DESIGN.md` — the `--summit-*` tokens and the `--oas-vue-*` scale rule
