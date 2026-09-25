# Stage 5 — Polish, CSS mechanics, tests, verification

**Goal:** make the page look like it belongs next to the OAS table, and lock the contract down
with tests.

## The three CSS mechanics — copy, don't rediscover

All three are documented at length in `.claude/OASProgression/PLAN_VUESTAGE_5.md` and implemented
in `OASProgressionTableVue.vue`'s `<style scoped>` block. Port that block essentially verbatim.
Each cost real debugging time; none should be re-derived.

**1. `::v-deep` is mandatory for anything Vuetify renders.** Vue 2's scoped CSS stamps its
`data-v-*` attribute only onto elements *this component's own template literally writes*, and the
transform appends the attribute to the **rightmost** compound selector. So
`.oas-vue-column-filter-input .v-input__slot` compiles to
`.oas-vue-column-filter-input .v-input__slot[data-v-xxx]`, which can never match — `.v-input__slot`
comes from Vuetify's render function and never carries the attribute. Every selector reaching
`.v-input__control`, `.v-input__slot`, `.v-select__selection`, `.v-icon` or the raw `<input>`
needs `::v-deep`.

**2. Two global 20px rules must be beaten with `!important`:**

```css
.v-application .theme--light.v-text-field input { font-size: 20px; }
.v-application .v-select__selection--comma      { font-size: 20px; }
```

Neither is itself `!important`, so a plain override at equal specificity still loses. Note the
second only applies once a value is *selected* — checking only the empty/placeholder state is how
this was originally missed.

**3. `v-data-table`'s row hover leaks onto the `#body.prepend` filter row.** Its selector
`tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper)` does not exclude
our row. Fix with `.oas-vue-column-filter-row:hover { background: transparent !important; }`, and
give the filter boxes an **opaque** `#eceff1` background (a translucent one composites against the
row and vanishes on white).

Plus the mobile fix: `.oas-vue-column-filter-input.v-input--is-dirty ::v-deep .v-input__icon--clear
{ opacity: 1 !important; }` — Vuetify's clearable "x" is `opacity: 0` until `:hover`, which touch
devices never have.

## Typography

Per the explicit per-view standard in `PLAN_VUESTAGE_5.md`, this is a flat, data-dense table view,
so it takes the **table-view** scale: headings 12px (Vuetify's own default, unchanged), filter
boxes and table content both **14px** via `--oas-vue-font-size-body`.

```css
.present-awards-data-table ::v-deep tbody td {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}
```

**No `position: sticky` on the header row.** Terrain's fixed 80px app bar sits over the page; the
original React build tried sticky headers and abandoned them, and `PLAN_VUE.md` records the same
conclusion for the Vue page. A `#body.prepend` row would not get sticky treatment anyway.

## Any new shared CSS

Per `DESIGN.md`, feature-specific styling that needs to be shared goes in `src/styles/index.css`
namespaced with a feature prefix (`present-awards-*`), **not** a per-feature stylesheet. Check
`index.css` for an existing class before adding one. Most of this page's styling should live in
the SFCs' scoped blocks, as the OAS table's does.

Do not introduce a second brand colour. `color="primary"` resolves to `#1070ca` via
`src/vuetifySetup.ts`.

## Tests

Jest cannot import `.vue` files here — `@vue/test-utils` is not installed and `jest.config.js` has
no `.vue` transform. So tests take one of the two established shapes.

**Logic tests** — instantiate the plain `defineComponent` options object, or call the exported pure
functions directly:

- `tests/unit/pages/PresentAwardsVue/services/PresentAwardsVueFilterPersistence.spec.ts` —
  round-trip, corrupt JSON, missing key, localStorage throwing. Model on the existing
  `tests/unit/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.spec.ts`.
- `tests/unit/pages/PresentAwardsVue/filterPresentAwardRows.spec.ts` — empty filters return
  everything; filters AND; case-insensitive; and specifically the **Presented Yes/No special
  case** from Stage 3, which is the one piece of filter logic that is not shared substring
  matching.
- `tests/unit/pages/PresentAwards/services/awardStorageEvent.spec.ts` — the Stage 1a extraction.
  `buildStorageEventPayload` is a pure function over `SummitAchievement[]`: assert one schedule
  item per member per batch, `leader_notes`/`assistant_notes` carrying member id and name,
  `equipment_notes === "2"`, and that a GUID round-trips through
  `processGuidsAndDates` → `reconstructGuidsAndDates`. This is the highest-value new test in the
  build — it is the piece where a silent regression corrupts stored data rather than just
  looking wrong.

**Source-text contract tests** — `fs.readFileSync` + `expect(source).toContain(...)`, following
`tests/unit/components/oas-progression-table-vue-render-contract.spec.ts`:

- `tests/unit/components/present-awards-table-vue-render-contract.spec.ts` — asserts the
  `#body.prepend` slot is used (not `header.<value>`), that `v-simple-checkbox` and `v-date-picker`
  are present, that `:close-on-content-click="false"` is set on the menu, and that `::v-deep`
  appears wherever a Vuetify-internal class is targeted.
- `tests/unit/router/summit-router-presentawards-vue-route.spec.ts` — route path and nav entry
  registered, following the existing `summit-router-oasprogression-vue-route.spec.ts`.

## Live verification

Build, load `dist/` unpacked in Edge, open against real unit data, and walk the whole page:

1. Row count matches the React page exactly, with Show Previously Presented in the same state.
2. Every column sorts; both date columns sort chronologically.
3. Every filter works; Clear filters resets.
4. Tick, date-pick, save, reload — state persists and the React page agrees.
5. Both exports produce the filtered set.
6. Refresh warns about unsaved edits.
7. Filters survive navigating away and back.
8. Narrow the window — the table scrolls horizontally rather than the page breaking.

**Check computed styles in DevTools, not just the stylesheet.** The recurring lesson across every
OAS stage: verify against the live rendered DOM's Computed panel *before* writing a CSS fix, not
after guessing. And if a fix that obviously should work has zero effect, suspect the build
pipeline before suspecting specificity — that is exactly how the `sideEffects` tree-shaking bug
hid every scoped style in the project.

## Wrap-up

Append a short "Outcome" section to `PLAN.md` recording what shipped, anything that diverged from
plan, and the open question of whether the Vue page should eventually take over the
`/summit/tools/PresentAwards` route with the React page archived to `-legacy` — the same promotion
OAS Progression went through. That decision stays with the user after they have compared the two
side by side.
