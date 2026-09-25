<!-- @format -->

# Plan Index: Vue+Vuetify OAS Progression Rebuild

## Status: promoted to the primary OAS Progression page

All 5 stages complete and verified live. Following the successful build-out, the user
decided (2026-09-24) to promote this Vue+Vuetify page to be the one and only OAS
Progression page rather than keeping it side-by-side with the React original:

- Vue page took over the short route (`/summit/reports/oasprogression`) and dropped
  the "(Vue)" suffix from its nav label/breadcrumb — it's now just "OAS Progression".
- The original React page was archived, not deleted: moved to
  `/summit/reports/oasprogression-legacy`, removed from the main nav menu, given a
  small in-page banner noting it's the retired reference version, and linked from the
  Home page under a new "Development tools" heading.

Everything below this point documents the original build (written while both pages
existed side-by-side as "the new Vue version" vs. "the existing React one") — read
route/label mentions of `oasprogression-vue` / "OAS Progression (Vue)" as historical.
The Display toggles have since changed; see "Display-toggle revisions" below, which
supersedes VueStage 3's description of them.

Approved by the user ("Lets start with the new work documented in PLAN_VUE.md") and
built through all four stages in one continuous session (2026-09-22/23). Every stage
was verified live in the unpacked extension by the user, not just via automated
tests. The plan's original 4-stage scope is done; VueStage 5 picks up one of the two
follow-ups noted below (the flat Table view), triggered by the user attaching a live
extract of Terrain's own `v-data-table` markup and asking for column sorting + a
global search filter.

## Display-toggle revisions (2026-09-25)

A round of changes driven by the user actually using the page, rather than by a
stage plan. Supersedes VueStage 3's description of the Display group. The heat map's
Display toggles are now:

| Label                       | State key             | What it does                                                             |
| --------------------------- | --------------------- | ------------------------------------------------------------------------ |
| Use codenames               | `useCodenames`        | unchanged                                                                  |
| Hide last name              | `hideLastName`        | unchanged (disabled while codenames is on)                                 |
| Break by patrol             | `breakByPatrol`       | unchanged (only shown when patrols exist)                                  |
| **Hide empty skills**       | `hideEmptyStreams`    | hides any skill+stream with no progress, **trunk sections included**       |
| **Hide empty top stages**   | `hideEmptyTopColumns` | trims empty trailing stage columns, **down to a floor of stage 2**         |
| **Hide complete/not started** | `onlyInProgress`    | hides the complete / not-started stage bars (behaviour unchanged, relabelled) |
| **Hide answered** (new)     | `hideAnswered`        | makes answered-but-unawarded squares invisible in place                    |

**Labels changed; state keys deliberately did not.** The keys are the persisted
localStorage shape (`summit.oasProgressionVue.filters`), so renaming them would
silently reset saved toggles for anyone who had set them. The mismatch between label
and key is the lesser cost, and is noted at each site.

### "Hide answered" — three iterations, and why it ended where it did

Worth recording because the end state contradicts the first two rounds of explicit
user choices. The user picked each of these deliberately, then revised after seeing
it live:

1. **Remove the squares entirely**, hiding answered *and* leaving awarded visible, and
   blank a stage cell once nothing was left in it.
2. **Narrowed to the squares alone** — the "blank the whole stage" part was dropped.
   With both this and `onlyInProgress` able to blank a stage cell, it was unclear
   which toggle was acting.
3. **Hide in place rather than remove.** Removing squares re-flowed each stage, so
   the remaining boxes shifted left as the filter went on and rows stopped lining up
   between members — which defeats the point of comparing who has what outstanding.

The end state: a `.oas-heatmap-square-hidden` class (`visibility: hidden`, border
cleared so no empty outline remains) applied in place of the normal state class. Two
things fell out of that:

- **Group-start borders no longer need recomputing.** The removal version had to
  derive them from the surviving squares, or a separator could strand itself on a
  square whose group-mate had just gone. Nothing leaves the array now, so the layout
  is stable by construction. The test that pinned the recomputation now pins that
  stability instead.
- **Hidden squares can't be hovered.** `visibility: hidden` takes an element out of
  hit-testing, so the tooltip is unreachable without special-casing the title.

Awarded squares stay visible throughout, by explicit choice — "to be done" reads as
the grey gaps plus the green history, not a stripped-down list.

### Divergence from the legacy React page

The two hide-empty filters now behave differently on the two pages. This is
deliberate, and commented at both sites:

| Behaviour            | Vue page (primary)              | React page (`oasprogression-legacy`) |
| -------------------- | ------------------------------- | ------------------------------------ |
| Stage-trimming floor | `MIN_VISIBLE_STAGE = 2`         | `MIN_VISIBLE_STAGE = 4`              |
| Empty-section rule   | every section, trunk included   | forked streams only (`stream !== null`) |
| Checkbox gating      | always shown                    | gated on `hasAnyEmptySections`       |

The change was made in the Vue page's own `isEmptyWithinRange`, **not** in the shared
`groupRowsForHeatMap.ts` service (whose `isEmpty` field the React page also reads), so
the legacy page is untouched. `hasAnyEmptySections` is now unused on the Vue side and
was removed along with its wiring through three files.

Consequence of including trunk sections: a skill with no progress anywhere now
disappears entirely, heading and all. `sections` builds one `SectionView` per
surviving section, so a skill with none contributes no `<tbody>` — no stray empty
heading is left behind.

### A real bug this surfaced

Five existing tests broke when trunk sections became hideable. The cause was not the
tests: `showEmptySections` declared `default: false`, while the page always binds
`!filters.hideEmptyStreams`, which defaults to `true`. The mismatch had been harmless
only because an empty trunk section could never be hidden before; once it could, an
omitted prop would have silently hidden whole skills. Fixed by correcting the default
to `true` — "show everything" is the right default for an omitted display filter.

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
- [x] [PLAN_VUESTAGE_2.md](PLAN_VUESTAGE_2.md) — Real heat-map visual layout in Vuetify (table structure, skill/stage grouping, color-coded cells, skill icons).
- [x] [PLAN_VUESTAGE_3.md](PLAN_VUESTAGE_3.md) — Filters/display features (Member search, Skills/Patrol multi-select, Stage range, Sort by, Display toggles) using Vuetify form controls.
- [x] [PLAN_VUESTAGE_4.md](PLAN_VUESTAGE_4.md) — Polish, PDF export parity, and end-to-end manual verification against the live site.
- [ ] [PLAN_VUESTAGE_5.md](PLAN_VUESTAGE_5.md) — Table view: Vuetify `v-data-table` with column sorting and a global search filter, as a second view mode alongside the heat-map.

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
- **`.vue` `<style scoped>` blocks were never actually bundled into `summit.css`,
  project-wide, until fixed in VueStage 5's later follow-up work** — root cause:
  `package.json`'s `sideEffects` array only listed `"*.css"`, which doesn't match a
  `.vue` file's style-block virtual module (its resource path ends in `.vue`, not
  `.css` — `lang=css` is a query param), so webpack's tree-shaking (`usedExports:
  true`) silently dropped every `.vue` component's scoped CSS from the final build
  with no error. Fixed by adding `"*.vue"` to `sideEffects`. This went unnoticed
  through VueStage 1–4 because every pre-existing `.vue` file in this codebase had
  an empty `<style scoped>` block (all real styling lived in the shared
  `src/styles/index.css`) — this Vue OAS Progression page's own `<style scoped>`
  blocks were the first real content ever put there, which is what surfaced the
  bug. See PLAN_VUESTAGE_5.md's "Real build-tooling bug found and fixed" section
  for the full investigation trail.

## Verification (applies to every stage)

- `npm run build` succeeds; `npx tsc --noEmit` shows no NEW errors (3 pre-existing
  errors in `DataGrid.tsx`/`OASHeatMap.tsx`/`PresentAwards.tsx` are known and unrelated).
- `npm test` — no regressions (baseline: 344/345 passing, 1 pre-existing unrelated
  UNC-path smoke-test failure).
- Manual check: load `dist/` as an unpacked extension, confirm the new page is
  reachable from its nav entry, renders real live unit data correctly, and that the
  **existing** OAS Progression page is completely unaffected (still pure React, still
  at its original route).

## After this stage — open question, not yet decided

Per this plan's own framing (see "Context" above), this rebuild was always meant as
the real, larger test of whether Vuetify is worth adopting more broadly across
Summit — that decision is still open. Two concrete follow-ups came up during the
build, neither started:

- **Table view (flat, sortable rows)** — now underway, see
  [PLAN_VUESTAGE_5.md](PLAN_VUESTAGE_5.md). Using Vuetify's own `v-data-table`
  (built-in sorting + a `search` prop for global filtering) rather than porting
  `DataGrid.tsx`/`@tanstack/react-table`, since `@tanstack/vue-table` requires Vue 3.
- **Whether to keep both pages long-term, retire the React one, or use this as the
  template for converting further Summit pages** — genuinely undecided; not a call to
  make without the user weighing in.
