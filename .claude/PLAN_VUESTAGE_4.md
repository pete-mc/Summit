<!-- @format -->

# VueStage 4 — Polish, Export Parity, and Verification

See [PLAN_VUE.md](PLAN_VUE.md) for context and current approval status (**still
DRAFT as of writing**). Depends on VueStage 3 being complete.

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

## Verification checklist (thorough, since this is the stage where the whole

rebuild gets signed off)

- [ ] Full manual walkthrough in the unpacked extension against real live unit data:
      every filter, sort, reset, reload (all + per-stream if kept), PDF export, and
      the heat-map's visual correctness (spot-check a few members/streams against the
      existing React page's same data, confirm counts/awarded-status match exactly —
      this is testing the **rendering**, not the data pipeline, which is unchanged
      and already trusted).
- [ ] Confirm the existing React OAS Progression page is completely unaffected —
      same route, same behavior, same look, as if this whole rebuild never happened.
- [ ] Confirm no console errors on either page, and no visual bleed from Vuetify's
      CSS onto the React page or onto other Summit pages (check at least 2-3 other
      Summit pages while Vuetify's CSS is loaded, since it's now global-scope in the
      bundle).
- [ ] `npm run build`, `npm run lint`, `npm test`, `npx tsc --noEmit` all clean
      (matching the existing baseline — no new errors/regressions).
- [ ] Bundle size sanity check: confirm the size increase from Vuetify (~5MB JS /
      ~640KB CSS, per prior-session measurements) is understood and acceptable — this
      is now a permanent cost of having this second page, not a temporary spike
      artifact.

## After this stage

Per [PLAN_VUE.md](PLAN_VUE.md)'s framing, this rebuild is itself the real test of
whether Vuetify is worth adopting more broadly. Once VueStage 4 is done and verified,
that's a natural point to step back and decide with the user: keep both pages
long-term for comparison, retire one, or use this as the template for converting
further Summit pages — not a decision to make now, while mid-build.
