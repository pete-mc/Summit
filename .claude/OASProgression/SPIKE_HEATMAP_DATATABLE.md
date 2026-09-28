# Spike — can the heat map be a `v-data-table`?

**Date:** 2026-09-28. **Branch:** `spike/heatmap-datatable`. **Restore point:** tag
`pre-heatmap-datatable-spike`.

**Question asked:** rather than hand-styling the heat map's `<table>` to look like Terrain's, can
it simply *be* a `v-data-table` and inherit Terrain's styling for free — and what is actually lost?

**Answer: technically yes, practically no.** It compiles and builds, but every feature that makes
`v-data-table` worth using has to be switched off, and the markup ends up identical to what is
there now, wrapped in a component whose contract is being fought rather than used.

## What was built

`OASHeatMapDataTableVue.vue` / `.ts` — the heat map rendered through `v-data-table`, extending the
real component's options object so only the *rendering* changed, not the grouping/filtering logic.

## Findings

### 1. Every `v-data-table` feature has to be disabled

```html
:items-per-page="-1"  disable-sort  disable-filtering  disable-pagination  hide-default-footer
```

- **Pagination** — a heat map split across pages is meaningless.
- **Sorting** — row order comes from `sortMembers()` with patrol grouping and codename handling.
  Vuetify's comparator knows nothing about any of it.
- **Filtering** — there are 9+ stage columns with no per-column semantics to filter on.
- **Footer** — nothing left to show once pagination is off.

That leaves the component contributing a `<thead>`, a wrapper `<div>`, and some CSS.

### 2. The body must be hand-rendered anyway

`v-data-table` emits exactly **one `<tbody>`** (`VDataTable.js:558`). The heat map needs one per
skill section — and that grouping is not cosmetic: the PDF export paginates on
`.oas-heatmap-skill-title-row` boundaries to keep a skill whole on a page.

So the `body` scoped slot takes over completely, and what goes inside it is the existing markup
essentially unchanged. **The rewrite does not remove any markup; it adds a wrapper around it.**

### 3. The data has to be flattened and immediately un-flattened

`v-data-table` requires a flat `items` array. The heat map's shape is three levels deep
(section → patrol group → member row). So the spike flattens it to satisfy the prop, then the body
slot discards the flattened version and reads the original tree back out of the component.

That round trip is the clearest single piece of evidence: the data is reshaped to get *into* the
component and reshaped back to render. Nothing is gained in between.

### 4. The colspan header cannot be expressed

The real heat map's stage-group header row uses `colspan` to span several stage columns under one
label. Vuetify's header renderer emits one `<th>` per header entry with no colspan support, so
reproducing it needs the `header` slot as well — hand-writing the `<thead>` too, at which point
the component is supplying only a wrapper `<div>`.

### 5. The PDF export breaks and needs fixing

`OasProgressionVueContent.ts:126` reads `heatMap.$refs.exportTable`, typed `HTMLTableElement`, and
`exportElementToPdf` walks its `<tr>` geometry to pick page breaks.

With `v-data-table`, a `ref` resolves to the **Vue component instance**, not an element. Fixable
(`$el`, or a ref on an inner element), but it is real work on the one piece of this page most
likely to fail silently — a broken export produces a wrong-looking PDF, not an error.

## What it would actually buy

Terrain's own frame, which is three CSS properties read off its `v-data-table` rule:

```css
background: var(--color-white, #fff);
border: 1px solid var(--color-light-charcoal, #e5e9ec);
border-radius: 4px;
```

Confirmed afterwards from the live site: Terrain does **not** style its table headers at all — no
background, colour, weight or border; everything visible is Vuetify's default. So removing the
heat map's green `thead` is a deletion, not a substitution. See DESIGN.md for the full palette.

That is available on the existing `<table>` for the cost of one wrapper, with no rewrite, no
disabled features, and no export risk.

## Recommendation

**Do not convert.** Instead:

1. Wrap the existing heat-map table in `v-card` (or a styled `<div>`) for Terrain's frame.
2. Remove the green `thead` (`--summit-color-bg-primary` on `.oas-heatmap-thead th`) and match
   Terrain's own header treatment.
3. Align cell padding with the Present Awards table.

The OAS **Table view** is already a `v-data-table`, so aligning *that* with Present Awards is
nearly free and should happen regardless.

## Status

Spike branch is **not** for merging. It exists so the finding is reproducible rather than taken on
trust. Delete it once the styling work lands, or keep it as a reference for anyone who asks the
same question again.

Return to the known-good state with:

```
git checkout pre-heatmap-datatable-spike
```
