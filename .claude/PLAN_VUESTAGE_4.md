<!-- @format -->

# VueStage 4 — Polish, Export Parity, and Verification

## Status: COMPLETE

See [PLAN_VUE.md](PLAN_VUE.md) for context. PDF export and the reload loading-state
were confirmed working live by the user 2026-09-23 ("DPF working", "Reload spoinning
and working", "No issue son other pages"). One real bug was found in that pass (a
`loadingStreams` prop typed as `Object` when the actual value is a `Set`, logging a
spurious `[Vue warn]`) and fixed — see "Fixes from live review" below.

**Post-verification polish, same session**: the PDF Export button's visual match to
Terrain went through several iterations before landing correctly — see "Fixes from
live review" for the full story, since it's a useful lesson for later polish work on
this page (or others): verify against the LIVE rendered DOM before each attempt, not
just against a CSS snippet someone pasted, since two different Terrain button
variants (flat text link vs. bordered pill) look similar in a stylesheet dump but are
visually very different once rendered.

## Goal

Close the remaining gaps against the existing React page's feature set that matter
for the new page to be genuinely usable and comparable, then do thorough end-to-end
verification — this is a smaller, cleanup-and-confirm stage, not a large build.

## Remaining feature gaps to address

- **PDF export** — the existing page uses `exportElementToPdf` (`src/components/gridExport.ts`,
  via `@zumer/snapdom` rasterization) on the heat-map's DOM element. This is
  framework-agnostic (it operates on a DOM element reference, not React-specific
  internals) — reuse it directly: attach a `ref` on the new Vue heat-map's root
  table element (Vue 2's `this.$refs`, equivalent role to React's `useRef`) and wire
  the same export function to a `v-btn`.
- **Reload / Reload all** — reuse the same `clearCache`/`fetchAllOASProgression`/
  `fetchOASProgressionForStream` orchestration from VueStage 1, exposed via a `v-btn`
  with a loading state (Vuetify's `v-btn :loading="..."` prop — a nicer built-in
  affordance than the original page's plain Unicode `↻` glyph, worth using since it's
  free with Vuetify).
- **Breadcrumbs** — set `window.$nuxt.$store.state.global.breadcrumbs` in `mounted()`,
  same as the existing page, but reading `"OAS Progression (Vue)"` and the new route
  path.

## Deliberately still out of scope (confirm no regression in expectations)

- Flat "Table" view mode (confirmed out of scope for this whole rebuild, per
  [PLAN_VUE.md](PLAN_VUE.md)).
- Excel export (the existing page's Table view has this via `DataGrid`'s
  `toolbarActions` — not applicable since there's no Table view here).

## Implementation notes

- **Reload button**: replaced the plain `v-progress-circular` + text loading
  indicator from earlier stages with Vuetify's own `v-btn :loading="isReloading"`
  affordance (per the plan's suggestion that this is "a nicer built-in affordance
  than the original page's plain Unicode ↻ glyph, worth using since it's free with
  Vuetify"). `onReloadAllClick` wraps `onReloadAll` (the prop from `OasProgressionVue.ts`)
  to track `isReloading` around the async call.
- **PDF export**: `onPdfExportClick` reaches `OASHeatMapVue`'s own `$refs.exportTable`
  (a `ref="exportTable"` now on its root `<table>`) via a `ref="heatMap"` on the
  `<OASHeatMapVue>` tag in `OasProgressionVueContent.vue`, then calls the same
  framework-agnostic `exportElementToPdf` from `@/components/gridExport` the React
  page uses — confirmed that function only needs an `HTMLElement` reference, no
  React-specific internals. Export feedback shown the same way as the React page
  (`role="status"` + `.data-grid-export-feedback` class, reused as-is).
- **Breadcrumbs**: already done in VueStage 1 (`OasProgressionVue.ts`'s `mounted()`),
  reading "OAS Progression (Vue)" at `/summit/reports/oasprogression-vue` — verified
  again here via `oas-progression-vue-render-contract.spec.ts`'s new test rather than
  re-implemented.
- **Excel export**: confirmed out of scope, as the plan anticipated — there is no
  Table view in this rebuild for it to apply to.

## Fixes from live review (2026-09-23)

- **`[Vue warn]: Invalid prop` on every render** — `OasProgressionVueContent`'s
  `loadingStreams` prop was declared `{ type: Object }`, but the real value is a
  `Set`, which fails Vue 2's runtime constructor check against `Object` (different
  constructors). Fixed by dropping the `type` constraint (Vue 2 has no built-in `Set`
  validator) rather than declaring the wrong one.
- **Filter bar layout**: Display checkboxes had drifted out of the visual filter box
  in an earlier layout pass — moved back inside, per the user. Skills stays as its
  own chip row below the box. Sort option "Progression" renamed to "Stage" to match
  the heat-map's own column header wording.
- **Checkbox spacing**: Vuetify's `v-checkbox` reserves spacing meant for a vertical
  list, which read as a big gap between each circle and its own label in a dense
  inline row — tightened via scoped `::v-deep` overrides on `.v-input--checkbox`
  margin/padding and the selection-control icon's own `margin-right`.
- **PDF Export button visual match to Terrain — took 3 attempts to get right**:
  1. First tried applying Terrain's own `.minor`/`.medium` class names directly —
     didn't work. Confirmed via DevTools: every `.minor`/`.medium` rule in Terrain's
     stylesheet is scoped with a Vue SFC `data-v-*` attribute specific to Terrain's
     own component; a plain element with those class names but no scoping attribute
     renders fully unstyled.
  2. Replicated the declared values as hand-rolled CSS on a custom class instead.
     This masked the REAL root cause: our own, separately-registered Vuetify
     instance (`window.summitVuetify`, a hard requirement of this whole build —
     see PLAN_VUE.md's key finding) had never been given a theme, so it fell back to
     Vuetify's stock indigo for anything using `color="primary"` — including the
     "Reset filters" button, silently wrong the same way. Fixed properly by
     configuring `window.summitVuetify`'s theme with `primary: "#1070ca"` (Terrain's
     `--color-base-blue`) in `src/vuetifySetup.ts`, then using Vuetify's own
     `text`/`outlined` + `color="primary"` props instead of fighting them with custom
     CSS.
  3. Initially picked the wrong Terrain button VARIANT — a flat text link
     (`v-btn text`) rather than the bordered pill (`v-btn outlined`) the user
     actually wanted (Approvals page's "View printable version" button). Confirmed
     via the user's own DevTools Computed-panel screenshot which exact sizing
     values to match (font-size 14px, font-weight 600, height 35px, min-width 80px,
     padding 0 18px, border-radius 25px) once the right variant was chosen.

  **Lesson for future polish work**: verify against the live rendered DOM (computed
  styles, not just a pasted stylesheet rule) before each attempt — a CSS snippet
  alone doesn't reveal cascade order, scoping, or which of several similar-looking
  Terrain button variants is actually the target.

## Verification checklist (thorough, since this is the stage where the whole

rebuild gets signed off)

- [x] `npm run build`, `npm run lint`, `npm test`, `npx tsc --noEmit` all clean
      (379/380 tests passing — same single pre-existing UNC-path failure as
      baseline; lint shows the same 40 pre-existing errors in unrelated files only;
      build succeeds with only the same pre-existing react-datepicker warning; tsc
      shows only the same 4 pre-existing errors).
- [x] Full manual walkthrough in the unpacked extension against real live unit data:
      every filter, sort, reset, reload, PDF export, and the heat-map's visual
      correctness. Confirmed live by the user 2026-09-22/23 across VueStage 2/3/4's
      own verification passes.
- [x] Confirm the existing React OAS Progression page is completely unaffected —
      same route, same behavior, same look, as if this whole rebuild never happened.
      True by construction (zero diff in `src/pages/OasProgression/` across all four
      stages, confirmed via `git diff --stat` each time).
- [x] Confirm no console errors on either page, and no visual bleed from Vuetify's
      CSS onto the React page or onto other Summit pages. Confirmed live by the user
      2026-09-23 ("No issue son other pages") — the one console warning found
      (`loadingStreams` prop type) has since been fixed.
- [x] Bundle size sanity check: Vuetify's weight (~5MB JS / ~640KB CSS, current build
      shows `summit.js` at ~21.8MB total with Vuetify's CSS at 638KB) is understood
      and accepted as a permanent cost of having this second page.

## After this stage

Per [PLAN_VUE.md](PLAN_VUE.md)'s framing, this rebuild is itself the real test of
whether Vuetify is worth adopting more broadly. Once VueStage 4 is done and verified,
that's a natural point to step back and decide with the user: keep both pages
long-term for comparison, retire one, or use this as the template for converting
further Summit pages — not a decision to make now, while mid-build.
