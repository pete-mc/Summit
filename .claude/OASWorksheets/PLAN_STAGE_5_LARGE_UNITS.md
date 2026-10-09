<!-- @format -->

# PLAN_STAGE_5_LARGE_UNITS.md — Transpose layout + column splitting

**IMPLEMENTED 2026-10-01 — see PROGRESS.md for the full account**, including two further
decisions resolved with the user during implementation (the patrol border toned down a second
time; the transposed header text keeps the full statement and scales its font down rather than
numbering/abbreviating it) and the Playwright/Edge print verification that replaced Stage 4's
"tests only" handoff.

Triggered by a real live-print failure, not a code review: Stage 4's 40-member fixture, printed
for real, clipped ~27 of 40 member columns off the right edge of the page with no second sheet —
screenshots in PROGRESS.md. The Stage 4 "flag it, don't clip it" warning banner was not enough;
seeing the actual clipped output showed a banner alone is not an acceptable mitigation when data
is silently lost. This stage replaces that mitigation with two real layout options, after a
live print test of PLAN_STAGE_4.md's original recommended fallback (splitting across sheets)
turned out to need a structural layout change to pair with it, not just more sheets.

Decided with the user before planning (recorded here, do not re-litigate mid-implementation):

1. **Transpose is a user-chosen layout, not a replacement for the current one.** Both ship,
   selectable per the user's own unit size/preference — the current member-columns layout works
   fine for small units and matches the xlsx/PDF references; transpose is for large ones.
2. **Transposed layout's Plan/Do/Review/Verify grouping**: a second header row above the
   I-Statement columns, spanning that group's own statement columns — the same pattern the
   existing layout already uses for patrol spans, applied to the opposite axis.
3. **Current (non-transposed) layout's still-too-wide fallback**, after rotating the group-band
   and member-name header text sideways: **split member columns across extra sheets**, repeating
   the same I-Statement rows on each. This was PLAN_STAGE_4.md's original §2 recommendation,
   deferred there and now actually built.
4. **Always landscape.** Portrait is dropped — `worksheetOrientation` and its UI control are
   removed entirely, not just defaulted away.

## 1. What each layout actually renders

### Layout A — "Members as columns" (today's layout, kept)

Unchanged in spirit — one table per Skill×Stream×Stage, I-Statement rows, member columns — but
with two new treatments to buy more columns before splitting is needed, both requested live:

- **Group-band text (Plan/Do/Review/Verify) rotated sideways** (`writing-mode: vertical-rl`),
  letting that column narrow from its current ~70px horizontal-text width down to roughly a
  single line-height. PLAN_STAGE_3.md originally left this horizontal "if legible" — it now needs
  to narrow, so revisit that call.
- **Member name headers rotated sideways.** Same technique, applied to
  `.oas-worksheet-member-header`. A rotated name needs a TALL header cell rather than a wide
  column — budget real header height (long codenames/names need room) and recheck the sticky
  patrol-span row's own top-offset math once the header is taller (see §4).

**Still too wide after both rotations → split into extra sheets.** See §3.

### Layout B — "Members as rows" ("Like Terrain" / transpose)

The real fix for scale: members are unbounded (just add rows, pages grow downward, no splitting
needed), I-Statements are bounded (a stage has 7–24 of them, which fits one page's width once
rotated).

```
┌─────────┬───┬───┬───┬───┬───┬───┬────────────┐
│         │  Plan     │   Do  │Review│ Verify   │  <- group-band header row (spans its columns)
│ Member  │St1│St2│St3│St4│St5│ St6  │  St7      │  <- I-Statement header row, TEXT ROTATED
├─────────┼───┼───┼───┼───┼───┼──────┼───────────┤
│ Amy    │[x]│03/.│.. │.. │.. │ ..   │  ..       │
│ Beth    │.. │.. │.. │.. │.. │ ..   │  ..       │
│ ... (40 rows, unbounded) ...
```

- **Rows**: one per member (plus, if `worksheetBreakByPatrol` is on, grouped/ordered by patrol —
  reuse `buildWorksheetPages`'s existing patrol ordering, now applied to rows instead of columns;
  a patrol divider ROW here, same convention as the heat map, since patrol is back to being a row
  concern on this axis).
- **Columns**: one per I-Statement, with a Plan/Do/Review/Verify spanning header row above
  (decision 2) — reuse the exact pattern `patrolSpansForPage`/the patrol header row already use,
  just transposed: group spans over I-Statement columns instead of patrol spans over member
  columns.
- **I-Statement header text rotated sideways** (decision from the live discussion) so the,
  typically 7–24, statement columns fit one landscape page width — this is the one case rotation
  is load-bearing, not cosmetic, since the full statement text is far too long to fit any
  reasonable column width even narrow.
- **Statement column widths "fit the page"**: given N statement columns and a fixed usable page
  width (A4 landscape minus margins minus the member-name column), divide evenly — `(usable width
  - name column width) / N`. Reuse `MAX_FITTING_COLUMNS`-style sizing math, not account for text
  wrapping within the rotated header (short labels like "St1" need not apply — see §2 for what the
  header actually shows).
- **Member-name column**: analogous to the statement column in Layout A — fixed reasonable width,
  not rotated (names read fine horizontally when they're rows, not columns).
- **Cell rendering**: identical three-state logic (`worksheetCellClass`, tick-box/date/green) —
  only the axis changes, not the cell semantics.

## 2. What goes in a transposed column header

**Decided with the user**: the FULL I-Statement text stays in the rotated header — no numbering/
legend, no abbreviation. The header's font scales down to fit, not the text content.

- **One font size per page/table**, sized to fit the LONGEST statement on that page — not a
  per-column independent size. Every header on one table reads at the same size; a short
  statement just uses less of the available column height than a long one does. Simpler to
  compute (one measurement pass per page) and reads more consistently than mixed sizes.
- **Column width**: divide the available landscape page width evenly across however many
  I-Statement columns the stage has (e.g. 24 statements → ~24 equal narrow columns). This sets the
  rotated header's available HEIGHT (since rotated, a column's width becomes the text's available
  length) and the body cells' width. Always fits one page width-wise, however narrow the result —
  no column-splitting on this axis (contrast with Layout A's member-column splitting in §3, which
  **is** needed, since Layout A's columns can't meaningfully narrow below a date/tick-box's own
  minimum size the way these can).
- **Computing the font size**: given the longest statement's character count and the column
  height (page width ÷ column count, roughly — the header's rendered height, not a guess), solve
  for a font size whose rendered text length (rotated, so this is the text's normal horizontal
  layout length) fits within that height. This needs a REAL measurement pass (render offscreen at
  a trial size, measure, adjust — the same "measure live, don't guess" discipline DESIGN.md's type
  scale section already established for this codebase), not a character-count-to-px formula
  assumed correct — font metrics vary by content (number of wide vs. narrow characters) enough
  that a formula alone risks the exact "looked right on paper, wrong once rendered" mistake
  DESIGN.md's type-scale section documents happening before on this project.
- A **minimum readable font size floor** is still needed for a stage with an unusually long
  longest-statement and/or very many columns — below that floor, scaling further defeats the
  point (illegible is not "fit"). Pick the floor empirically once this is built and printed for
  real, not asserted in advance.

## 3. Column splitting (Layout A only)

When Layout A still has more member columns than fit after both rotations:

1. Compute a `MAX_FITTING_COLUMNS` equivalent for the rotated layout — the old 7/13 (portrait/
   landscape) numbers were for horizontal-text headers; re-derive for rotated headers, likely
   higher since the member-header column width shrinks to roughly one line-height regardless of
   name length. Validate live once built, same as PLAN_STAGE_4.md's original numbers were.
2. Split `page.members` into batches of that size. Each batch becomes its own `<table>`, with
   identical I-Statement rows (same `page.groups`) but only that batch's member columns.
3. **Reuse the index-alignment discipline from PLAN_STAGE_1.md §4a** — splitting columns means
   slicing `WorksheetRow.cells` to match each batch, the exact same "keep two arrays aligned by
   the same index list" shape as "Hide completed" already solves. Consider factoring a shared
   helper rather than a second hand-rolled slice, since this is the second time this exact
   shape has appeared.
4. Batches print as consecutive sheets (same `break-after: page` mechanism already in
   `printWorksheets.ts`), each repeating the page title plus a "(members 1–13 of 40)"-style
   suffix so a leader with a stack of printouts can tell the batches apart and reassemble them
   mentally.
5. The on-screen warning banner (`hasOverflowingPages`) changes meaning: once splitting is real,
   it is no longer "this will be squeezed/clipped" (a problem) — it becomes informational ("this
   stage will print across N sheets"), since nothing is lost any more. Reword it accordingly;
   don't leave alarming wording describing a failure mode that no longer occurs.

## 4. Sticky-header height changes

Both rotations and the transposed layout's own two-row header (group band + statement) change
header row heights from Stage 3's measured values. Every sticky `top:` offset hardcoded against
the old header height (`.istatement-stage-header`'s `top: 28px` equivalent pattern — see
`OASWorksheetsVue.vue`'s existing patrol-header/member-header stacking) needs re-measuring live
against the new rendered heights, not re-derived from the old numbers. This is exactly the kind of
"measure live, don't guess" case DESIGN.md's type-scale section warns about.

## 5. New filter state

```ts
/** Worksheets view only — replaces worksheetOrientation (dropped: always landscape now). */
worksheetLayout: "membersAsColumns" | "membersAsRows";
```

Remove `worksheetOrientation` from `OASProgressionVueFilterState` entirely, and the orientation
`v-select` from `OASWorksheetFiltersVue`. Replace with a `worksheetLayout` toggle (a `v-select` or
a small `v-btn-toggle`, matching whichever reads more clearly as "layout" rather than "filter" —
decide at build time, not load-bearing either way). Default to `membersAsColumns` (today's
behaviour, so existing users see no change until they opt in).

`printWorksheets.ts`'s `orientation` parameter becomes unconditionally `"landscape"` — simplify
its signature rather than passing a constant through, so a future reader doesn't wonder whether
portrait is still reachable.

## 6. Tests

- `buildWorksheetPages.ts`: if row-grouping by patrol is needed for Layout B specifically, confirm
  whether the existing member ordering (already patrol-aware for column order, per Stage 3's
  `orderMembersByPatrol`) is sufficient as-is for row order too, or needs its own pass — likely
  sufficient, since rows and columns are both "a list of members in some order," but verify rather
  than assume.
- New pure function(s) for the column-split batching (§3) — the same index-alignment test shape as
  PLAN_STAGE_1.md §4a's "Hide completed" tests: batch boundaries, last-batch remainder size, cells
  index-aligned with each batch's own member slice.
- `pageExceedsColumnLimit`'s replacement threshold(s) for the rotated-header layout.
- Render-contract assertions for: `worksheetOrientation` fully removed, `worksheetLayout` present
  and defaulting correctly, the layout toggle control existing.

## Verification

This whole stage is print-reality-driven, same caveat as PLAN_STAGE_4.md: tests cover the pure
batching/threshold logic, but the actual judgement call — "does 40 members on N sheets actually
read and fit, does the rotated text stay legible, is the split's sheet count reasonable" — needs a
real print, ideally of a few different unit sizes (10, 25, 40+), not just the one 40-member
fixture that caught this in the first place. Regenerate that fixture (or a family of them at a few
sizes) once this stage is built, and print for real again before calling it done — the exact
mistake this stage exists to fix was trusting an untested assumption the first time.
