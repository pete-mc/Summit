<!-- @format -->

# Plan Index: Vue+Vuetify OAS Progression Rebuild

## Status: APPROVED — implementation in progress

Approved by the user ("Lets start with the new work documented in PLAN_VUE.md").
VueStage 1 is complete (see [PLAN_VUESTAGE_1.md](PLAN_VUESTAGE_1.md)'s own status).

## Context

The existing OAS Progression heat-map page (`/summit/reports/oasprogression`) is
built as Vue (routing/lifecycle shell) + React (all actual content), matching every
other Summit page's established pattern. Investigation (prior session) into adopting
Vuetify — Terrain's own Material Design component library — for Summit UI found that
real Vuetify 2 components **can** be used inside Summit, but only via a second, fully
independent Vue instance mounted into its own div (built from Summit's own bundled
`vue`, with `Vue.use(Vuetify)` called on it) — NOT by using Vuetify tags directly
inside a `.vue` SFC that Terrain's own router renders, since that renders against
Terrain's own separate `Vue.options.components` registry, which never has Vuetify
registered on it. This was proven with a single `<v-select>` control (rolled back via
`git revert`, preserved in git history at commits `acdc7ca`..`c893a6c`, sitting on top
of `d845544`).

The user wants to build on this proof by creating a **full Vue+Vuetify version of the
whole OAS Progression page**, as a new, separate page living alongside the existing
React one — not replacing it. This lets the two be compared directly, keeps the
working page's users unaffected, and treats the new page as the real, larger test of
whether Vuetify is worth adopting more broadly across Summit. Building the *entire*
page as one Vue component tree (rather than many small islands) also avoids the
per-control mount/wiring overhead the single-`<v-select>` spike highlighted — one
mount point, one lifecycle, ordinary Vuetify composition inside it.

Decisions already confirmed with the user:

- New route + separate nav menu entry (not a toggle on the existing page).
- Vue version covers the **heat-map view only** — the flat "Table" view
  (`DataGrid.tsx`, built on `@tanstack/react-table`) is out of scope, since
  `@tanstack/vue-table` requires Vue 3 (Summit is on Vue 2.7) and Vuetify's own
  `v-data-table` is a big enough separate undertaking to defer.
- Page/route/directory name: **`OasProgressionVue`**. Route:
  `/summit/reports/oasprogression-vue`. Nav label: **"OAS Progression (Vue)"**.
- Stage breakdown mirrors the original React build's own 4-stage shape (see
  `.claude/PLAN_STAGE_1.md` through `_4.md`): scaffolding/naive render → visual
  heat-map layout → filters/display features → polish+verification. Since this is a
  **port**, not a from-scratch design, all data/service logic is reused as-is — only
  the rendering layer is new.
- VueStage 2's visual fidelity target: a loose adaptation using natural
  Vuetify/Material Design styling — not a pixel-identical port of the React page's
  exact CSS.

## Stages

- [x] [PLAN_VUESTAGE_1.md](PLAN_VUESTAGE_1.md) — Scaffolding: new route, nav entry, Vue-instance mount pattern (avoiding Terrain's router for content), naive unstyled render of the data.
- [ ] [PLAN_VUESTAGE_2.md](PLAN_VUESTAGE_2.md) — Real heat-map visual layout in Vuetify (table structure, skill/stage grouping, color-coded cells, skill icons).
- [ ] [PLAN_VUESTAGE_3.md](PLAN_VUESTAGE_3.md) — Filters/display features (Member search, Skills/Patrol multi-select, Stage range, Sort by, Display toggles) using Vuetify form controls.
- [ ] [PLAN_VUESTAGE_4.md](PLAN_VUESTAGE_4.md) — Polish, PDF export parity, and end-to-end manual verification against the live site.

Each stage is independently checkable — see its own file for detail, acceptance
criteria, and tests. Work through them in order; later stages depend on earlier ones.

## Reused as-is (no changes needed)

All of the existing page's data/service layer is pure, framework-agnostic TypeScript
— reused directly by the new Vue page, imported from their current location under
`src/pages/OasProgression/services/` rather than duplicated:

- `buildOASProgressionRows.ts` — fetch + join pipeline (tree → template →
  achievements → tidy rows). `fetchAllOASProgression`/`fetchOASProgressionForStream`.
- `groupRowsForHeatMap.ts` — rows → `HeatMapSection`/`SectionMemberRow`/`HeatMapStage`
  tree structure the heat-map renders from directly.
- `filterHeatMapSections.ts` — `filterMembersByPatrol`, `groupMembersByPatrol`,
  `collectPatrolNames`, `sliceStagesToRange`, `formatStageProgress`, `sortMembers`,
  `OAS_SKILLS` constant.
- `getCodename.ts` — deterministic member-id → codename.
- `getSkillIconUrl.ts` — resolves bundled skill icon URLs via the
  `data-summit-extension-url` DOM-attribute bridge (isolated-world → main-world; see
  the "chrome.runtime is not reachable from summit.js" gotcha in
  `.claude/PLAN_STAGE_4.md` — do not reintroduce a direct `chrome.runtime` call from
  the new page's code).
- `OASProgressionFilterPersistence.ts` — either reused directly (if the filter shape
  stays identical) or copied to a small Vue-specific equivalent under a new
  `services/` folder if the shape needs to diverge — decide in Stage 3.

## Known gotchas to carry over from the original build (`.claude/PLAN_STAGE_4.md`)

- **Terrain's fixed app bar (80px) sits on top of the page** — don't assume
  `position: sticky; top: 0` will look right; the original build tried and abandoned
  a sticky header for this reason. Plan for a plain (non-sticky) header row unless a
  more robust approach is deliberately chosen.
- **`chrome.runtime` is only reachable from `summitloader.js`** (the isolated-world
  content script), never from code bundled into `summit.js` (main-world, where all
  page/service code — including the new Vue page — actually runs). Any new browser-
  extension-API need must cross that boundary via a DOM attribute, same as
  `getSkillIconUrl.ts` already does — don't add a new direct `chrome.*` call.
- **`web_accessible_resources` in `manifest.json`** already exposes
  `images/oas-skills/*` — no manifest change needed unless new assets are added.

## Verification (applies to every stage)

- `npm run build` succeeds; `npx tsc --noEmit` shows no NEW errors (3 pre-existing
  errors in `DataGrid.tsx`/`OASHeatMap.tsx`/`PresentAwards.tsx` are known and unrelated).
- `npm test` — no regressions (baseline: 344/345 passing, 1 pre-existing unrelated
  UNC-path smoke-test failure).
- Manual check: load `dist/` as an unpacked extension, confirm the new page is
  reachable from its nav entry, renders real live unit data correctly, and that the
  **existing** OAS Progression page is completely unaffected (still pure React, still
  at its original route).
