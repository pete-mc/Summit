<!-- @format -->

# PLAN_STAGE_3.md — The heat-map table

Goal: render the real table. Still no filters (Stage 4) — render all Skills,
stages 1–9.

New: `src/pages/IStatements/components/IStatementHeatMap.vue` + `.ts`

## Structure

A two-row `<thead>` giving the grouped columns:

```
| I-Statement | Paddling · Paddling | Paddling · Canoeing | ... |
|             | 1 2 3 4 5 6 7 8 9   | 1 2 3 4 5 6 7 8 9   | ... |
|-------------|---------------------|---------------------|-----|
| I can ...   |   ■     ■           |       ■             |     |
```

- Row 1: the `I-Statement` label cell (with `rowspan="2"`), then one `<th>` per
  Skill+Stream group with `colspan="9"`.
- Row 2: the stage numbers 1–9 repeated under each group.
- Body: one `<tr>` per `IStatementRow`; first cell the `displayText`, then
  `groups.length × 9` cells, each either empty or containing the purple square
  `<div>`.

Follow [`OASHeatMapVue.vue`](../../src/pages/OasProgressionVue/components/OASHeatMapVue.vue)
for the wrapper/scroll/table class pattern (`.oas-heatmap-scroll` etc.) and its
scoped-style approach of pinning `font-size`/`font-family` to the shared scale.

## Cell lookup performance

`groups.length × 9` is potentially ~200 columns × a few hundred rows = tens of
thousands of cells. **Do not** do an `Array.find` over `row.cells` per cell —
that is O(rows × cols × cells) and will be visibly slow.

Precompute once, in the `.ts` (a `computed`), a per-row `Set` of
`"skill|branch|stage"` keys, then each cell is a single `Set.has`. Build the
rendered cell array per row in that same computed so the template does a plain
`v-for` over ready-made values rather than calling a method per cell.

## The purple square

`.claude/DESIGN.md` requires new colours be added as `--summit-color-*` tokens in
`src/styles/index.css` rather than hardcoded. There is an existing
`--summit-color-status-answered: #7d6694` which **is already the purple** used
for the OAS heat-map's in-progress state.

Reuse that token — a new near-identical purple would be exactly the drift
DESIGN.md warns about. If a visually distinct purple is genuinely wanted here,
add one properly-named token (`--summit-color-istatement-present`) rather than
a literal. **Ask before introducing a second purple**; default to reusing
`--summit-color-status-answered`.

Square sizing/shape should match `.oas-heatmap-square` — reuse that class if it
carries no OAS-specific semantics, otherwise add `.istatement-square` in
`index.css` following the `<feature>-<element>` naming convention.

## Sticky columns

The `I-Statement` text column must stay visible while scrolling horizontally
across ~200 columns, and the two header rows must stay visible scrolling
vertically. `position: sticky` on both, with the top-left corner cell sticky on
both axes. Check how the OAS heat-map handles its `Member` column and match it.

I-statement text is long — set an explicit width on that column (suggest
`min-width: 320px; max-width: 420px`) and allow wrapping, otherwise one long
statement stretches the column arbitrarily.

## Group visual separation

With ~20 adjacent 9-column groups, boundaries must be obvious: a heavier left
border on each group's first stage column, and alternating subtle background
tints per group. Skill+Stream group headers should be visually distinguishable
from the stage sub-headers (the existing heat-map uses the Summit brand green
for its header row — match that treatment).

## Verification

Build, reload the extension, open the page on Terrain and confirm:

1. Headers align — stage columns sit under the correct group (an off-by-one in
   `colspan` is the likely bug here; count them in DevTools if unsure).
2. Squares land in the right cells: pick one known statement — e.g. the buddy
   system statement from Aquatics stage 1 — and verify by hand against the raw
   `latest.json` that its squares appear in exactly the right Skill+Stream+Stage
   positions, and nowhere else.
3. Sticky column and headers behave when scrolling both axes.
4. Scrolling is smooth — if it stutters, the per-cell lookup is the suspect.
5. Check at a narrow window width; horizontal scroll only, no layout collapse.
