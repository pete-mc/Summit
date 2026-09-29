# PLAN_STAGE_6_MATCH_OAS.md — match OAS Progression's layout, style and table structure

**Status:** stages 1–4 built 2026-09-29, 13 tests passing, build clean. **Stage 5 (live
verification) outstanding** — sticky behaviour on both axes cannot be unit tested.

Addresses:

> - match layout, style and spacing of OAS progression page.
> - Make sure table structure and style is using same elements as the OAS progression page.

## Why the two pages drifted

I Statements was built alongside the OAS Progression *React* page and copied its markup:
a hand-written `<table class="oas-heatmap-table">` with a green `.oas-heatmap-thead`.

OAS Progression Vue then moved on. It now renders through `v-data-table` with Terrain's own
frame, and deliberately dropped the green header (see `SPIKE_HEATMAP_DATATABLE.md` and the
comment in `OASHeatMapVue.vue`) — Terrain does not style table headers at all.

I Statements never followed, so it is the last Vue page still on the old pattern. The two pages
are visual siblings whose shared `--oas-vue-*` scale exists specifically to stop this drift, so
the divergence is a bug against an already-stated intent, not a new design decision.

## Three distinct gaps

### 1. Filter panel spacing — the DEV_NOTES item, fixed at its cause

`.oas-vue-filter-panel` is used by three pages, declared by two, and **I Statements declares it
nowhere**. It gets no flex layout and no gap at all, which is the most visible part of "doesn't
match".

Fixed the way `DESIGN.md` says it should be: the class moves into `src/styles/index.css` **once**,
and the per-page copies go. Each page redeclaring it is the actual cause — every copy can drift
independently, and one page having no copy at all is how I Statements ended up unstyled.

The shared rule also sets the space *below* the panel, which no page set. That is the DEV_NOTES
entry itself:

> Filter area doesn't have same space below it, as per OAS Progression, Present Awards etc. This
> layout should be standard for every page we make.

Present Awards used `gap: 8px` and OAS Progression `gap: 12px`. Standardising on **12px** — OAS
Progression is the page being matched to, and it is the one with a full filter row where the
tighter value looked cramped.

One deliberate exception stays per-page: `.oas-heatmap-controls` on Present Awards drops the
bordered card look, because that page has a single checkbox group rather than a full filter row.
That is a real difference, not drift, so it stays local.

### 2. Table structure — `v-data-table`, same as OAS Progression

The ask is explicitly "same elements". `IStatementHeatMap` becomes a `v-data-table` configured
exactly as `OASHeatMapVue` is:

```
:items-per-page="-1" disable-sort disable-filtering disable-pagination
hide-default-header hide-default-footer dense
```

Those disabled props are not losses. This heat map has never sorted, filtered or paginated
through Vuetify — its order is fixed by the matrix builder and its filtering is the bar above.
Switching them off stops Vuetify adding UI for features the page does not use.

Both slots must stay hand-written, for the same reasons they are on the OAS page:

- **`#header`** — the two-row header uses `colspan` to span stage columns under one group label.
  Vuetify's own header renderer emits one `<th>` per header entry and cannot express that.
- **`#body`** — kept so the sticky first column and per-row `present[]` rendering survive
  unchanged. There is no per-section `<tbody>` split here, unlike the OAS page, because
  I Statements has no section boundaries to paginate on.

`:headers` still has to be passed: `v-data-table` needs it internally even with a custom header.

### 3. Header styling — green goes

`.oas-heatmap-thead` is dropped, and the local `.istatement-group-header` / `.istatement-label-header`
green backgrounds with it, matching the OAS page. `.oas-heatmap-thead` itself **stays in
`index.css`** — the legacy React OAS page still uses it.

Sticky positioning is kept, and this is the one place where care is needed: the OAS heat map is
not sticky, so there is no precedent to copy. Removing the green background makes the sticky
header transparent, and rows would show through it while scrolling. The sticky cells therefore
need an explicit opaque background — `--color-white` to match the frame, not the old green.

## What must not regress

- **Sticky first column and sticky two-row header** — the defining feature of this view at
  ~180 columns × ~500 rows. `v-data-table`'s wrapper is the scroll container, so `position: sticky`
  offsets resolve against it rather than `.oas-heatmap-scroll`.
- **The frozen `boolean[]` per row** — a deliberate performance choice (~90k cells). Untouched;
  this is a template and style change only, with no change to `IStatementHeatMap.ts`.
- **`.istatement-group-start` borders** — the 2px rules separating ~20 adjacent 9-column blocks.
- **The variant badge** — marks over-merged rows, and is the only way an over-merge is visible.

## Staging — as built

1. ✅ `.oas-vue-filter-panel` into `index.css`; both per-page copies removed.
2. ✅ `IStatementHeatMap` onto `v-data-table` with hand-written header/body slots.
3. ✅ Green header dropped; sticky cells given explicit opaque backgrounds.
4. ✅ 13 render-contract tests in `istatement-matches-oas-progression.spec.ts`.
5. ⬜ **Live verification** — see below.

### Two things found while building that the plan did not anticipate

**The dead page-level classes.** `.istatement-panel` and `.present-awards-panel` were written on
their pages' root elements and defined nowhere — only `.oas-progression-panel` existed. They
looked load-bearing and did nothing, which is a second instance of the same failure as the filter
panel, and nothing flags it: a class matching no rule is not an error. All three now share one
rule in `index.css`.

**The specificity trap in the sticky header.** Dropping the green meant adding a blanket
`::v-deep thead th` background, which compiles to `[data-v-*] thead th` — `(0,1,1)`. The existing
per-cell `.istatement-stage-header` was a bare class, `(0,1,0)`, so it **lost**, and the muted
sub-header row would have silently disappeared into the white header above it. Every rule in that
block is now written at the same shape so they resolve by source order. Recorded in `DESIGN.md`,
since it applies to any future table conversion.

## Live verification checklist (stage 5)

Unit tests assert the markup and CSS are present; they cannot assert the result *looks* right.
Worth checking in the browser:

- [ ] Header stays pinned when scrolling **down**, with no rows showing through it.
- [ ] First column stays frozen when scrolling **right**, with no cells showing through it.
- [ ] The corner cell stays above both while scrolling diagonally.
- [ ] Stage-number row still reads as a sub-header (muted, not white) — this is the rule the
      specificity trap above would have broken.
- [ ] Zebra striping reaches the frozen first column, rather than leaving it a solid block.
- [ ] Group-start borders still separate the ~20 stream blocks.
- [ ] Filter panel spacing matches OAS Progression and Present Awards side by side — the point
      of the whole exercise.
