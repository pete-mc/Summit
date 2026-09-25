<!-- @format -->

# VueStage 5 — Table View (Vuetify `v-data-table`)

## Status: COMPLETE — built and live-verified, including a round of fixes from live review

See [PLAN_VUE.md](PLAN_VUE.md) for context. This stage picks up the first of the two
"After this stage" follow-ups that plan left open: adding the flat, sortable Table
view that the React page has (via `DataGrid.tsx`) and this Vue page deliberately
skipped in its first 4 stages.

User confirmed the first build working live (2026-09-23): "Table show. All features
work as expected. Survives f5 refresh." — then requested a round of GUI/behavior
fixes, all addressed; see "Fixes from live review" below.

## Trigger

The user attached a live HTML extract from Terrain's own Approvals page showing its
native `v-data-table` markup (`v-data-table-header`, sortable `<th>`s with
`aria-sort`, `mdi-arrow-up` icons) and asked to add an equivalent progression table
with column sorting and a global search filter.

## Goal

Add a second view mode to the Vue OAS Progression page — "Heat map" (existing) vs.
"Table" (new) — where Table is a flat, one-row-per-achievement grid built on
Vuetify's own `v-data-table` component, matching Terrain's native table look/behavior
(the component the user's HTML extract is itself built from) rather than a v2 port of
the bespoke `DataGrid.tsx`/`@tanstack/react-table` grid the React page uses.

**Why `v-data-table` and not a `DataGrid.tsx` port**: `@tanstack/vue-table` requires
Vue 3 (Summit is on Vue 2.7), so the React grid's exact engine can't be reused as-is.
`v-data-table` is Vuetify 2's own built-in data table — it already has column sorting
and can be paired with a plain `v-text-field` bound to its `search` prop for global
filtering, giving the same two behaviors the user asked for with far less custom code
than reimplementing sorting/filtering by hand (as `DataGrid.tsx` does). It also
produces the exact native look the user's attached extract shows, which is a better
fit for "does Vuetify look right here" than a hand-rolled table would be.

## Data source (reused, no new fetching)

`OasProgressionVueContent` already holds `items: OASProgressionRow[]` (the flat rows
— same data `DataGrid.tsx`'s Table view renders today, one row per member × skill ×
stage × input). No new service/fetch code — the new table component receives `items`
as a prop, same as `OASHeatMapVue` does today.

## Columns

Match the existing React Table view's column set exactly (`OasProgression.tsx`'s
`columns` array), since that's already the agreed field set for this flat view:

| text          | value        | sortable |
| ------------- | ------------ | -------- |
| Member        | memberName   | yes      |
| Skill         | stream       | yes      |
| Stream        | branch       | yes      |
| Stage         | stage        | yes      |
| Group         | inputGroup   | yes      |
| I-Statement   | iStatement   | yes      |
| Answered      | answered     | yes      |
| Awarded       | awarded      | yes      |
| Date          | date         | yes      |

`answered`/`awarded` are booleans — rendered as "Yes"/"No" via a scoped slot
(`#item.answered`/`#item.awarded`), same display mapping `DataGrid.tsx` does via
`accessorFn`.

## Implementation

- **New component**: `src/pages/OasProgressionVue/components/OASProgressionTableVue.vue`
  + `.ts` (external script file, per this codebase's established `.vue` convention —
  see PLAN_VUE.md's "Vue 2 SFC external-script convention" gotcha). Props: `items:
  OASProgressionRow[]`.
  - Originally a global `v-text-field` bound to `v-data-table`'s own `search` prop;
    later replaced entirely by per-column filters — see "Follow-up: per-column
    filters" below for the current design.
  - `<v-data-table :headers="headers" :items="filteredItems" dense>` — sorting
    is `v-data-table`'s default built-in behavior per column (click header to sort,
    matches the `aria-sort`/arrow-icon behavior visible in the user's attached
    extract); no custom sort function needed unless a column needs non-lexical order
    (stage is numeric — Vuetify sorts numbers correctly by default when the
    underlying value is a `number`, so `stage` must be passed as a number, not a
    formatted string).
  - Reasonable default `items-per-page` (e.g. 25, matching the React grid's own
    default page size) — `v-data-table` paginates built-in.
- **View toggle**: `OasProgressionVueContent.vue`'s header row gets a single button
  that flips `viewMode` between `"heatmap"`/`"table"`, labeled "Show Table" /
  "Show Heatmap" depending on the current state (see "Fixes from live review" below
  for why this replaced an earlier `v-btn-toggle`-based two-button control).
  `viewMode` was added to `OASProgressionVueFilterPersistence.ts`'s persisted shape
  (matching the React page's own `OASProgressionFilterPersistence.ts`, which already
  had it), so the choice survives a reload like every other filter on this page.
- **Heat-map-only filters hide when in Table mode**: the existing filter bar
  (member/skills/patrol/stage-range/sort/display toggles) only makes sense for the
  heat-map; when `viewMode === "table"`, hide `OASProgressionFiltersVue` entirely and
  show only the new table's own filtering (per-column filters — see "Follow-up"
  below). This matches the React page's existing behavior (`OasProgression.tsx`
  renders the heat-map controls only inside the `filters.viewMode === "heatmap"`
  branch).
- **PDF/Excel export**: originally deferred as a separate follow-up (see "Fixes from
  live review" below for when it was picked up) — the React page's Table view uses
  `DataGrid`'s generic Excel/PDF export via `gridExport.ts`'s row/column-mapping
  functions, a different code path from the heat-map's `exportElementToPdf`-on-a-DOM-
  element approach, reused here the same way.

## Deliberately out of scope

- ~~Column filters per-column~~ — superseded; see "Follow-up: per-column filters"
  below. The global search box itself was later removed entirely in favor of
  per-column filters only (also see that section).
- Any change to the existing heat-map view, its filters, or the untouched React page.

## Verification

- `npm run build`, `npm run lint`, `npm test`, `npx tsc --noEmit` all clean at the
  same established baseline (no new errors/failures beyond the pre-existing known
  ones documented in PLAN_VUE.md).
- New test(s) for `OASProgressionTableVue` following this project's established
  Jest-can't-import-`.vue` workaround (plain Vue-options-object test and/or
  `fs.readFileSync` source-text assertions — see PLAN_VUE.md's "Jest testing
  limitation" note).
- Manual check in the unpacked extension: toggle between Heat map/Table, confirm
  real live data renders as flat rows, click a column header and confirm it sorts,
  type into the search box and confirm rows filter, confirm the heat-map's own
  filters are hidden while in Table mode and reappear when switching back.
- Confirm the existing React OAS Progression page (both its Heat map and Table
  views) is completely unaffected — zero diff in `src/pages/OasProgression/`.

## Fixes from live review (2026-09-23)

- **Date column showing full ISO timestamps** — `OASProgressionRow.date` sometimes
  carries a full timestamp (e.g. `2024-02-03T06:33:41.791295+00:00`) rather than a
  plain date, since it can fall back to `achievement.status_updated` or an imported
  award timestamp (see `buildOASProgressionRows.ts`). Fixed by rendering the date
  column through a `formatDate` helper (`OASProgressionTableVue.ts`) that trims to
  the first 10 characters — display-only, the underlying row data/shared row-building
  logic is untouched.
- **Refresh button moved to its own header row**, above the Heat map/Table toggle —
  common to both views now, rather than living inside the heat-map-only PDF-Export
  row as originally built.
- **PDF + Excel export added for the Table view**, top-right of its own row (a
  separate row from Refresh) — the follow-up flagged as deferred in this plan's
  original "Implementation"/"Deliberately out of scope" sections above, picked up
  immediately once the user asked. Uses `exportGridToPdf`/`exportGridToExcel`
  (row/column-mapped, not the heat map's DOM-screenshot `exportElementToPdf`) against
  a `TABLE_EXPORT_COLUMNS` list matching the table's own headers.
- **Exports only the currently filtered rows, not every row** — the user asked for
  this explicitly ("can we only export what is filtered?"). `v-data-table`'s
  `search` filtering happens internally in Vuetify with no exposed "currently
  visible rows" output, so `search` was lifted from local state in
  `OASProgressionTableVue` up to `OasProgressionVueContent` (a `search` prop +
  `.sync`/`update:search`), and a new exported `filterOASProgressionRows()` function
  replicates `v-data-table`'s own default filter (case-insensitive substring match
  across every column) so the parent can compute the same filtered set for export
  that the table is currently showing. The heat map's own PDF export needed no
  equivalent change — it's already a screenshot of the live-filtered DOM.
- **View toggle visually broken — four attempts, then abandoned for a simpler design**:
  1. Built with Vuetify's `v-btn-toggle`, each option `v-btn` with its own `outlined`
     prop — rendered as two separate pills touching end-to-end, not one capsule
     (`outlined` gives every button its own independent border regardless of
     grouping).
  2. Restyled as one bordered capsule (dropped per-button `outlined`, added
     `rounded` + custom border/background CSS on the group, relying on
     `color="primary"` for the active button's fill) — but `color` on a
     `v-btn-toggle` in Vuetify 2 tints *every* button in the group at all times,
     not just the active one, so both ends up the same color.
  3. Removed `color="primary"` from the group, added CSS targeting `.v-btn--active`
     directly for the fill — still didn't work. Root cause found by reading
     Vuetify's own source: `v-btn-toggle` is a `v-item-group`, whose default active
     class is `v-item--active`, not `v-btn--active` (an unrelated ripple/focus
     class) — the selector silently matched nothing.
  4. Fixed with an explicit `active-class="oas-vue-toggle-active"` on the group (a
     class this stylesheet owns, so the selector can't silently miss). Live DOM
     evidence (user-provided outerHTML + computed styles) then showed the
     `active-class` binding itself was correct — Heat Map genuinely had the active
     class and Table didn't — but BOTH buttons still rendered identically dark-blue.
     Cause: a page-level rule (`.theme--light.v-btn.v-btn--has-bg.v-btn--is-elevated`)
     applies a hardcoded gradient background to any "elevated" button regardless of
     selection state, and `v-btn` gets `v-btn--is-elevated` by default unless given
     `depressed`/`text`/`outlined`. Added `depressed` to stop Vuetify emitting that
     class in the first place, removing the conflict at the source rather than
     trying to out-specificity it.
  5. At this point the user stepped back and asked for a simpler design instead of
     continuing to chase Vuetify/global-CSS interactions: **the whole `v-btn-toggle`
     group was removed** and replaced with a single plain `v-btn` (styled with the
     same `.oas-vue-pill-btn` class already used for PDF/Excel Export, so it's
     visually consistent with the rest of the header row) that flips `viewMode`
     between `"heatmap"`/`"table"` and shows "Show Table" / "Show Heatmap" as its
     label depending on current state. No toggle-group styling to fight at all.

  **Lesson**: when a Vuetify component's visual behavior doesn't match expectations,
  verify against the live rendered DOM (computed styles, actual class list) before
  each attempt rather than reasoning from library source or memory alone — this is
  the second time this exact lesson has come up on this page (see VueStage 4's PDF-
  button saga). And when a "simple" UI piece turns into repeated round-trips, a
  simpler design that sidesteps the fight entirely (here: one button instead of a
  styled toggle group) can be the more pragmatic fix than continuing to chase it.

- **Header button order + a stray divider line — both fixed cleanly once the user
  supplied exact DevTools evidence**:
  - Buttons reordered twice (first attempt landed backwards) to the final, confirmed-
    correct left-to-right order: Excel Export (Table view only) → PDF Export →
    Show Table/Heatmap → Refresh (rightmost), so each button's position is stable
    whether or not Excel Export is present.
  - A `::after` line the user reported near the Display checkbox group turned out,
    from the user's own DevTools "Computed"/element inspector, to be
    `.oas-field:not(:last-child)::after` — a 1px divider rule from the shared
    `src/styles/index.css` that draws between every non-last `.oas-field`. The
    Display `<fieldset>` had `class="oas-field oas-heatmap-display-group"`, but
    didn't need `.oas-field` at all (its own `.oas-heatmap-display-group` CSS
    already fully defines its layout) — removing just that one class name stopped
    the divider rule from targeting it, with zero risk to the untouched React page
    (that class is shared, but this was the only place the Vue page used it
    unnecessarily).
  - Separately, a bare `<fieldset>`'s own browser-default border (a different, only
    superficially similar artifact reported earlier) was fixed by explicitly setting
    `border: none; padding: 0; margin: 0` on `.oas-heatmap-display-group`.

## Follow-up: per-column filters, global search removed (2026-09-23)

User asked to add per-column text filtering (one filter box per column, matching
`DataGrid.tsx`'s own per-column filter row on the React page's Table view), then
mid-implementation asked to remove the global search box entirely, leaving the table
filterable by column only.

- **Mechanism finding**: confirmed directly against this repo's installed Vuetify 2
  source (`node_modules/vuetify/lib/components/VDataTable/VDataTable.js`) that
  `header.<value>` scoped slots only customize a cell *within* the single existing
  header `<tr>` — they cannot emit an entire extra sibling row. The correct mechanism
  for "a row of filter inputs directly under the column headers" is the `body.prepend`
  scoped slot, rendered as the first child of `<tbody>` (immediately after `<thead>`,
  with nothing in between) — `genBody()` in the same file. Not used elsewhere on this
  table yet, so no `fixed-header`/sticky-header interaction to worry about, but worth
  remembering if that's added later (a `body.prepend` row won't get sticky treatment
  automatically, since it isn't part of `<thead>`).
- **State design**: `columnFilters: Record<string, string>` (keyed by header `value`,
  same open shape `DataGrid.tsx` uses) is lifted from `OASProgressionTableVue` to
  `OasProgressionVueContent` via `.sync` — the same pattern the (now-removed) global
  `search` prop used, for the same reason: the parent needs the currently-filtered
  row set for the Table view's PDF/Excel export, and there's no way to ask a live
  `v-data-table` instance which rows are visible without `$refs` gymnastics untested
  elsewhere in this codebase.
- **`filterOASProgressionRows` signature changed** from `(items, search)` to
  `(items, columnFilters = {})` — ANDs every non-empty column filter together
  (case-insensitive substring match per field), matching `DataGrid.tsx`'s exact
  semantics. `answered`/`awarded` filter against their raw stringified boolean
  (`"true"`/`"false"`), not the "Yes"/"No" display text — carried forward as a known,
  deliberate limitation rather than special-cased, consistent with how the (now
  removed) global search behaved for those two columns.
- **Global search removed**: the `v-text-field`/`search` prop/`:search="search"`
  binding on `v-data-table` were all deleted; `v-data-table` now receives
  `:items="filteredItems"` (a computed applying only `columnFilters`) with no
  built-in Vuetify filtering involved at all.
- **Clear filters**: a small `v-btn text` ("Clear filters"), visible only when
  `hasActiveColumnFilters` is true, resets `columnFilters` to `{}` in one click —
  matching the heat-map view's existing "Reset filters" precedent
  (`OASProgressionFiltersVue.vue`), so both views have a consistent clear-everything
  affordance.
- **Placeholders/labels**: each column's filter box reuses that header's own `text`
  field directly (e.g. "Member", "I-Statement") as both `placeholder` and
  `aria-label="Filter {text}"` — deliberately did NOT port `DataGrid.tsx`'s
  `toColumnPlaceholder` humanizer (which re-derives a label from the field's `value`
  via regex), since `HEADERS` already carries a better hand-written label than a
  mechanical re-derivation would produce, and the explicit `aria-label` (rather than
  relying on `placeholder` alone, which isn't reliably exposed as an accessible name)
  is a small accessibility improvement over the React reference's own filter-input
  labeling.

## Follow-up: search icons, dropdown filters, and a Yes/No filter bug fix (2026-09-23)

User asked three things: (1) a search icon on each filter box, (2) some columns as
dropdowns instead of text, (3) reported that the Answered/Awarded filter boxes don't
match typed "Y"/"N"/"yes"/"no".

- **Root cause of (3), a real bug**: `answered`/`awarded` are plain booleans,
  filtered by stringifying the raw value (`String(true)` → `"true"`), but *displayed*
  as "Yes"/"No" via a separate template mapping — typing "yes" matched against
  `"true"`/`"false"` text and found nothing. Fixed by converting Answered/Awarded to
  Yes/No dropdowns (value stored as the exact string `"true"`/`"false"`, label shown
  as "Yes"/"No") rather than patching the text-match — this also directly satisfies
  ask (2) for those two columns.
- **Columns converted to dropdowns** (confirmed with the user column-by-column, Stream
  added in a follow-up round below): Skill (`stream`, options = the fixed `OAS_SKILLS`
  constant), Stream (`branch`, derived from loaded data), Stage (`stage`, fixed 1–9),
  Group (`inputGroup`, derived from loaded data), Answered/Awarded (fixed Yes/No).
  Member, I-Statement, and Date stayed text filters (too many distinct values for a
  dropdown to be useful) and got the requested `mdi-magnify` search icon.
- **No new filter-state shape**: a dropdown's selected value is still just a string
  written into the same `columnFilters: Record<string, string>` map `filterOASProgressionRows`
  already ANDs/substring-matches — dropdowns are a different input *widget*
  (`v-select` vs `v-text-field` in the `#body.prepend` filter row, branched per a new
  `header.filterType` field), not a different filtering mechanism. `filterOASProgressionRows`
  itself needed no changes.
- **Group's (and later Stream's) dropdown options are derived from ALL loaded `items`,
  not the currently filtered set** (explicit user choice) — so picking one filter
  never causes another column's own dropdown options to shrink/disappear out from
  under it. Skill's options come from the fixed `OAS_SKILLS` constant instead of
  being derived at all, since that list already exists and is more stable than
  deriving from loaded rows.

### Same-day follow-up: Stream as a dropdown too, and filter-row visual cleanup

User asked for Stream (`branch`) to also become a dropdown (same derived-from-
loaded-items treatment as Group), and reported the filter row itself looked
"chunky and messy" — Vuetify's default `v-text-field`/`v-select` reserve space for
a label row plus an underline, so nine of them side by side looked oversized and
heavy next to the actual data rows (confirmed from the user's own screenshot of the
rendered row). `solo flat` was added to every filter input (drops the underline and
default box-shadow/elevation) — correct on the first attempt.

**The font-size and background fixes needed a second attempt, this time built on live
DevTools evidence rather than guessing** (the user explicitly called this out: "Don't
guess at CSS, ask me for details" — a repeat of the same lesson from VueStage 4's PDF
button and this stage's own view-toggle saga). What the first, unverified attempt got
wrong, and what the evidence actually showed:

- **Font-size**: guessed at a `.oas-vue-column-filter-input` wrapper-level font-size
  rule with no `!important` — didn't work; text still rendered at 20px. The user
  provided the actual DevTools Computed panel output: a **global** rule,
  `.v-application .theme--light.v-text-field input { font-size: 20px; }`, not
  something in this component's own CSS at all — applies to every `v-text-field` on
  the page. Confirmed (again via the user checking live) that this rule only affects
  `v-text-field`'s own `<input>`; `v-select`'s selected-value text
  (`.v-select__selection`) was already rendering correctly and needed no change.
  Fixed with a scoped, `!important`-qualified override targeting exactly
  `.oas-vue-column-filter-input.v-text-field input` — `!important` is required here
  specifically because the global rule this overrides is not itself `!important`, so
  a plain override at equal-or-lower specificity would still lose.
- **Background/hover**: the first attempt used a translucent background
  (`rgba(0,0,0,0.04)`), which the user's screenshot showed as invisible on a white
  row and only visible once the row itself turned grey on hover — an inversion, not
  a fix. Root cause, confirmed via the user's DevTools screenshot of the winning
  rule: `v-data-table` applies its own row-hover highlight to any `<tr>` inside
  `<tbody>` — `tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) { background: rgb(238,238,238); }`.
  The filter row (rendered via `#body.prepend`, also a `<tbody>` child) isn't
  excluded by either `:not()`, so it picked up this hover highlight like a real data
  row even though it isn't one. Fixed two ways: (1) `.oas-vue-column-filter-row:hover { background: transparent !important; }`
  opts the row out of that highlight entirely, and (2) each filter box's own
  background changed to a solid, opaque color (`#eceff1`, not translucent) so it
  reads clearly regardless of the row's own background state.
- **Placeholder text removed entirely** (separate, explicit ask) — the column header
  directly above each box already names it, so a placeholder repeating the same word
  inside the (now much smaller) box was redundant clutter.

**Lesson, stated plainly this time**: verify CSS against live DevTools evidence
*before* writing the fix, not after a guess fails — this is the second stage in a
row where guessing first cost extra round-trips that asking first would have saved.

### Real build-tooling bug found and fixed: `.vue` scoped `<style>` blocks were never bundled, project-wide

After the font-size and hover fixes above were applied, the user reported they had
**zero visible effect at all** — not "still wrong," but completely unchanged,
including the dropdown-selection font-size (`.v-select__selection--comma`, a
separate 20px rule the user found via DevTools that a *placeholder's* font-size
check earlier had missed, since a placeholder and a selected value are different
elements). Given the user's explicit "don't guess at CSS" instruction, this was
investigated at the build-output level instead of the DOM/CSS-specificity level:

- `dist/styles/summit.css` contained **zero** occurrences of any `oas-vue-*` class,
  and zero `data-v-*` scoped-style attribute selectors anywhere in the file — not
  just for this stage's own new CSS, but for every `.vue` component in the entire
  project, including long-established ones like `PresentAwards.vue`. (Those
  happened to have empty `<style scoped>` blocks already, which is why nobody had
  hit this before — this Vue OAS Progression page is the first time real CSS was
  ever put inside a `.vue` file's own `<style>` block in this codebase.)
- Traced through webpack's actual module graph (via `webpack --json` stats output)
  rather than reasoning from vue-loader's source alone: the style block's virtual
  module (`...vue?vue&type=style&index=0&id=...&lang=css`) DOES resolve correctly
  through the full loader chain (`MiniCssExtractPlugin.loader → css-loader →
  vue-loader/stylePostLoader → vue-loader`) with zero errors, and produces a valid
  `css/mini-extract` module — so vue-loader, `VueLoaderPlugin`, and the webpack CSS
  rule are all configured correctly and not at fault.
- Root cause: `package.json`'s `sideEffects` field was `["*.css", "./src/vuetifySetup.ts"]`.
  Webpack's `usedExports`/tree-shaking (enabled via `optimization.usedExports: true`
  in `webpack.config.js`) drops any module webpack believes has no side effects and
  whose exports are unused — and a `.vue` file's style-block virtual module has a
  resource path ending in `.vue` (the `lang=css` is a query parameter, not part of
  the path), so the `"*.css"` glob never matches it. The module compiles
  successfully but gets silently tree-shaken out of the final bundle before asset
  emission — explaining every observed symptom at once: no build errors, a
  successfully-resolved module in the stats graph, yet zero output in the final
  CSS file.
- **Fix**: added `"*.vue"` to `package.json`'s `sideEffects` array. Rebuilt and
  confirmed directly (not assumed): `dist/styles/summit.css` grew from 700,469 to
  710,436 bytes, `oas-vue-column-filter-input` now appears in it, and 18
  `data-v-*` scoped selectors are present where there were previously zero. This
  is a project-wide fix — every `.vue` component's scoped styles now actually reach
  the built extension, not just this stage's own table filter row.
- Full test suite re-run after the `package.json` change (a build-tooling config
  file, not scoped to one component) to rule out any regression: 402/403 passing,
  same single pre-existing UNC-path failure as baseline.

**Lesson**: when a CSS fix that should obviously work has "zero effect" (not
"wrong," but literally no change at all), suspect the build pipeline before
suspecting CSS specificity — check whether the rule is even present in the shipped
output before debugging further style overrides on top of it.

### Second real bug found in the same session: scoped CSS selectors need `::v-deep` to reach Vuetify-internal elements

Even after the `sideEffects` fix shipped the CSS, the user reported (with DevTools
evidence again) that the background/font-size rules still weren't applying — this
time `.oas-vue-column-filter-input` didn't appear **anywhere** in the Styles panel
for the inner `.v-input__slot` element, not even crossed out by a competing rule.

Root cause: Vue 2's scoped CSS only stamps the component's `data-v-*` attribute onto
elements that component's own `<template>` literally writes. `v-select`/`v-text-field`'s
root element gets it (since it's directly in `OASProgressionTableVue.vue`'s own
template), but everything Vuetify renders *inside* that component (`.v-input__slot`,
`.v-input__control`, `.v-select__selection`, `.v-icon`, the raw `<input>`) is
generated by Vuetify's own render function, not by this template — so those elements
never receive the attribute. A plain scoped rule like `.oas-vue-column-filter-input
.v-input__slot` compiles to `.oas-vue-column-filter-input[data-v-xxx] .v-input__slot`
— note the attribute only lands on the LEFT selector (the one this component wrote);
the right side (`.v-input__slot`) has no such constraint added, which sounds like it
should still work as a normal descendant selector... but Vue's actual scoped-CSS
transform also appends the attribute to the RIGHTMOST compound selector by default,
turning it into `.oas-vue-column-filter-input .v-input__slot[data-v-xxx]` — which
can never match, since `.v-input__slot` never carries that attribute.

Fixed by wrapping every such selector in `::v-deep` (e.g. `.oas-vue-column-filter-input
::v-deep .v-input__slot`), which tells Vue's scoped-CSS compiler to stop appending the
attribute from that point in the selector onward. This exact pattern was already
proven working elsewhere in this same page (`OASProgressionFiltersVue.vue`'s checkbox-
spacing fix, `.oas-heatmap-display-group ::v-deep .v-input--checkbox`) — not a new
technique, just one this file's CSS additions hadn't applied consistently. Verified
directly in the rebuilt `dist/styles/summit.css`: the compiled selector reads
`.oas-vue-column-filter-input[data-v-11bfb714] .v-input__slot` (attribute on the left
element only, `.v-input__slot` unconstrained) rather than the non-matching form.

Also fixed in the same pass: the earlier "v-select needs no font-size override"
conclusion (from this same follow-up's font-size investigation above) was wrong —
it was only checked against a v-select in its EMPTY/placeholder state. Once a value
is actually selected, Vuetify renders it via `.v-select__selection--comma`, a
different element with its own separate global 20px rule
(`.v-application .v-select__selection--comma { font-size: 20px; ... }`, again found
via the user's own DevTools). Both the v-text-field `<input>` and v-select's
`.v-select__selection` now get the same `::v-deep`-qualified 13px override.

**Lesson, again**: two real, non-obvious bugs (a build-tooling gap, then a scoped-CSS
mechanics gap) were hiding behind what looked like ordinary CSS specificity fights —
both only surfaced by insisting on live DOM/build-output evidence rather than
reasoning about what "should" work from documentation or memory.

### Same-day polish round: mobile clearable icon, layout jump, and heat-map view parity (2026-09-23)

With the filter row finally rendering correctly, the user requested five smaller
follow-ups across both views:

- **Table view — clearable "x" unreachable on mobile**: Vuetify's clearable icon is
  `opacity: 0` by default, reaching `opacity: 1` only on `:hover`/`:focus` — no
  hover state exists on touch devices. Fixed by forcing `opacity: 1 !important` on
  `.v-input__icon--clear` whenever the field carries Vuetify's own
  `.v-input--is-dirty` class (i.e. whenever it actually has a value), independent of
  hover/focus state.
- **Table view — "Clear filters" button causing layout jump**: the button's
  container had no reserved height, so the table shifted up/down as the button
  appeared/disappeared with `v-if`. Fixed by wrapping it in a
  `.oas-vue-clear-filters-row` with a fixed `min-height` matching the button's own
  rendered height, so the row's height stays constant whether or not the button is
  showing.
- **Heat-map view — Member field's redundant placeholder**: `label="Member"` was
  already present (giving the same floating-label look as Skills/Patrol/Stage/Sort
  by), but a `placeholder="Name"` duplicated it once the label floated up — removed,
  matching the earlier table-view placeholder-removal decision.
- **Heat-map view — "Display" legend not blue like the other field labels**: a plain
  `<legend>` doesn't inherit Vuetify's label styling. Added a scoped
  `.oas-vue-display-legend` class coloring it to Terrain's own blue
  (`var(--color-base-blue, #1070ca)`), matching the floating-label look on the
  Skills/Patrol/Stage/Sort-by fields it sits beside.
- **Font-size standardization, per-view (not a single shared size)**: the same
  global 20px rules found earlier (`.v-application .theme--light.v-text-field input`,
  `.v-application .v-select__selection--comma`) apply page-wide, so both views'
  filter fields needed their own overrides. After checking DevTools together, the
  user set a deliberate per-view standard rather than one shared number:
  - **Table view** (a flat, data-dense view): headings 12px (unchanged), filter
    boxes AND table content both **14px** — the filter-box override was corrected
    from an earlier, unverified 13px guess up to 14px to match the table's own
    existing content size exactly.
  - **Heat-map view** (a more visual page): content and headings are already 16px;
    filter fields matched to that existing **16px** rather than the Table view's
    smaller size, so each view is internally consistent rather than both views
    sharing one arbitrary number.
  - Both use the same `::v-deep`-qualified override mechanism established earlier
    in this section, just with view-appropriate values.
- **Checkbox spacing (`.v-input--selection-controls__input` margin-right) —
  resolved once the actual winning rule was found**: a third rule, not previously
  known about, turned out to be the real source of the reported 24px:
  `.v-application.theme--light .v-input--checkbox .v-input--selection-controls__input`
  — a Terrain page-level rule that restyles every checkbox into a custom pill/circle
  look (white background, 1px border, 20px border-radius) and sets its own
  `margin-right: 24px` as part of that. Its selector specificity (3 chained classes)
  ties with this page's own existing override (`.oas-heatmap-display-group[data-v-*]
  .v-input--selection-controls__input`, also 3: class + attribute + class), so
  cascade order alone wasn't reliably deciding the winner. Fixed by changing the
  value to 12px (per the user's request) and adding `!important`, guaranteeing it
  wins regardless of source order.

  **Not actually a false alarm — a real follow-up request**: mid-investigation, the
  user reported the Member field's placeholder, the Display legend's blue color,
  and the 16px font-size fix as apparently not showing, despite all three being
  verified present in the built `dist/` output. A screenshot then clarified what
  was actually happening: "Member"'s label WAS correctly showing Vuetify's default
  behavior — sitting in its normal resting position inside the box because that
  field is EMPTY (Vuetify only floats a label to the small/blue heading position
  once a field has focus or a value; Skills/Stage from/etc. only looked different
  because they already held values). This was not a bug, but the user then asked
  for a genuinely new thing: force Member's label into the permanently-floated
  position/color regardless of whether the field has a value, so it always matches
  the other fields' look rather than only once typed into. Same ask for "Display":
  its blue color needed to be corrected once the exact winning rule was found (see
  below) — the legend itself was already working, just with the wrong shade.

### Same-day, same-thread: the correct Terrain blue token, and forcing Member's label permanently floated

Once the user provided the actual DevTools evidence for the "Skills"/"Stage from"
labels' blue color, two things were corrected:

- **Wrong blue token**: the Display legend had been colored with `--color-base-blue`
  (`#1070ca`, Terrain's blue used elsewhere on this page for buttons/toggles) —
  plausible-looking, but not what's actually driving the other filter labels' blue.
  The real winning rule, from the user's DevTools: `.v-application
  .v-select.v-input--is-label-active.v-text-field .v-label { color:
  var(--color-scouts-medium-blue); top: 2px !important; }` — a **different** Terrain
  token, `--color-scouts-medium-blue` (`#00348d`, a darker navy), applied
  specifically to an active/floated label. Both `.oas-vue-display-legend` and the
  new Member-label override (below) now use this correct token.
- **Member's label forced permanently floated**: added `.oas-heatmap-controls
  ::v-deep .v-text-field .v-label { max-width: 133%; transform: translateY(-18px)
  scale(0.75); ... }` — replicates Vuetify's own `.v-label--active` transform
  (confirmed via `vuetify.css`), applied unconditionally rather than only when
  Vuetify's own JS-driven active/inactive state toggles it on. Deliberately did NOT
  try to force Vuetify's actual `.v-label--active` class itself (tied to internal
  focus/value reactive state) — replicating just the resulting CSS avoids any risk
  of Vuetify's own label-position logic fighting a forced class that doesn't match
  its internal state.

**First attempt at the follow-up got the actual ask wrong**: rather than apply one
shared set of values to both Member and Display, each was given its own
*individually-researched, technically-correct* set — Member's own native Terrain
rule differs from Skills' (font-weight 600 + NunitoSans-light vs. Skills' `inherit`
+ NunitoSans-regular), so Member and Display were "fixed" to match their own
respective source rules rather than to look the same as each other. The user called
this out directly: "Stop making arbitrary decisions. I told you I wanted them the
same." — an unrequested design decision (preserving each element's own "authentic"
underlying rule) substituted for the explicit, simple instruction actually given
(one consistent look, full stop).

**Corrected**: a single shared value set — `color: var(--color-scouts-medium-blue,
#00348d)`, `font-size: 18px`, `font-family: NunitoSans-regular`, `font-weight:
normal`, `letter-spacing: -0.01em` (Skills' own values, taken as the reference) — is
now applied identically to both the Display legend (via a renamed
`.oas-vue-filter-heading-match` class, replacing the old `.oas-vue-display-legend`)
and Member's floated label override, with zero per-element variation.

**Lesson**: when a user gives explicit values and says "make them the same," apply
those values uniformly — don't substitute independent research into what each
element's "own" correct styling would be, even when that research is accurate. The
instruction itself was the spec; extra fidelity to each element's native behavior
was not asked for and produced a worse outcome than just doing what was said.

## After this stage

The second open question from PLAN_VUE.md (keep both pages / retire React / use as
a template) remains undecided and is unaffected by this stage.
