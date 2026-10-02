<!-- @format -->

# PLAN_STAGE_4.md — Print and PDF

**IMPLEMENTED 2026-10-01 — see PROGRESS.md for the full account.** Two things below turned out
differently from how this plan originally described them, confirmed by actually trying the
recommended approach rather than assuming it would work:

- §3's "recommended path" (`exportElementToPdf`) was **not used**. Checked first, as the plan asked:
  it rasterizes its one element to a single canvas/JPEG and slices that into pages — the wrong
  shape for many independent tables each needing a real repeating `<thead>`, and its section-break
  logic is hardcoded to the heat map's own CSS classes. Built a small new service,
  `printWorksheets.ts`, that opens the rendered tables in a brand-new window and calls `print()`
  there instead (real text, real `<thead>` repetition, no bitmap).
- Because of that, §3's "hide Terrain's chrome" problem **does not exist** — a brand-new window
  has no Terrain chrome in it to hide in the first place. None of that section's `@media print`
  chrome-hiding CSS was needed.
- §2's column-splitting-across-sheets was **not implemented**, taking the plan's own "ship a
  warning instead" escape hatch: an on-screen notice flags pages over the rule-of-thumb column
  limit for the chosen orientation, rather than silently clipping or deferring the whole feature.

The rest of this document is kept as originally written, for its still-accurate reasoning
(page-break CSS, print legibility, the paging rule) — read it alongside the note above, not
instead of it.

The stage that makes the feature actually useful. DEV_NOTES: *"The page serves enables
leaders to print worksheets for manual checkoff during an activity."* Until this stage
the worksheet is a screen view; here it becomes paper.

This is the one stage that **cannot be verified by tests**. Pagination, page breaks and
header repetition only exist in a real print preview. Budget for iteration in the
browser rather than expecting it right first time.

## 1. One Skill × Stage per sheet

PLAN.md's paging rule, confirmed from the xlsx's 17 separate sheets. Each
`WorksheetPage` starts a new piece of paper.

```css
@media print {
  .oas-worksheet-page {
    break-after: page;        /* modern */
    page-break-after: always; /* Chromium still honours this; keep both */
  }
  .oas-worksheet-page:last-child {
    break-after: auto;
    page-break-after: auto;   /* no trailing blank sheet */
  }
}
```

The `:last-child` reset matters — without it every print run ends with a blank page,
which looks like a bug to the user and wastes paper every time.

A single page's table may itself overflow onto a second sheet when a stage has many
I-Statements (the sample's `Stage 5 - Bushwalking` has 24 rows, which is near the limit
for one portrait page with wrapped statement text). That is acceptable — but it must
break *between* rows, never through one, and the header must repeat:

```css
@media print {
  .oas-worksheet-page thead { display: table-header-group; }
  .oas-worksheet-page tr    { break-inside: avoid; page-break-inside: avoid; }
}
```

`display: table-header-group` is what makes a `<thead>` repeat on every printed page of
a long table. It only works on a real `<thead>` in a real `<table>` — which is part of
why Stage 3 builds a plain table rather than a `v-data-table` whose internals we do not
control.

Also worth setting: `break-inside: avoid` on a group band so a `Plan`/`Do` band is not
split across sheets where it reasonably fits on one. Apply it but **do not fight it** —
a 15-row band cannot avoid a break, and over-constraining produces huge gaps. If the two
rules conflict, row-level integrity wins.

## 2. Orientation and fit

The references include both a `_Vertical` xlsx and a `_Horizontal` PDF, so Topo offers
both. The deciding factor is member count: the statement column needs real width, and
each member column needs enough for `03/02/24` plus a tickable box.

Rule of thumb to validate live: portrait fits roughly 6–8 member columns before the
statement text wraps to unreadable slivers; landscape roughly 12–14. A unit of 25 does
not fit either.

**Do this rather than guessing:** make orientation an explicit user choice, defaulting
to landscape (the more forgiving of the two), and handle overflow by **splitting member
columns across sheets** — the same page's statements repeated with the next batch of
members. The xlsx reference does not solve this (it is a spreadsheet; it just gets
wider), so it offers no guidance here, and silently clipping columns off the right edge
of the paper is the one outcome that must not happen.

Add to Stage 3's filter state, persisted with the rest:

```ts
worksheetOrientation: "portrait" | "landscape";
worksheetMembersPerSheet: number;   // 0 = no split
```

If the column-splitting work looks large once the single-sheet case is working, ship the
orientation control and a clear on-screen warning when the column count exceeds what
fits, and move splitting to its own stage. **Say so to the user rather than shipping
silently clipped sheets.**

```css
@media print { @page { size: A4 landscape; margin: 10mm; } }
```

A4, not Letter — Australian users. `@page size` cannot be changed per-element mid-document
in Chromium, so orientation is a whole-print-run choice, which matches making it a filter.

## 3. What must not print

Everything that is not the worksheet. The page carries Terrain's own chrome — nav drawer,
app bar, breadcrumbs — plus Summit's filter row, tab strip and export buttons.

```css
@media print {
  .oas-worksheet-no-print { display: none !important; }
}
```

Apply that class to the filter panel, the tab strip and the export/refresh row.

⚠️ **Hiding Terrain's own chrome is the hard part, and it is not ours to restyle.**
Summit's CSS is injected as a content-script stylesheet and **loses cascade ties**
(DESIGN.md), so a bare `.v-navigation-drawer { display: none }` may simply not win.
Two options, in order of preference:

1. **Print only the worksheet, by rendering it to its own document** — reuse
   `exportElementToPdf` from [`gridExport.ts`](../../src/components/gridExport.ts), which
   the heat map already uses for its PDF export (`onPdfExportClick`,
   `OasProgressionVueContent.ts:154`). It takes an element and produces a PDF from it
   alone, so Terrain's chrome never enters the picture. **This is the recommended path**
   — it sidesteps the cascade problem entirely rather than fighting it.
2. Browser print with `@media print` rules hiding Terrain's chrome, using `!important`
   and high-specificity selectors read off the live DOM. Only if the user specifically
   wants Ctrl+P to work.

Do both if `exportElementToPdf` turns out not to handle multi-page tables well — check
that first, since the heat map's existing use is a single wide table rather than a
17-page document. **Verify its pagination behaviour before committing to it**; if it
rasterises or clips, option 2 becomes the path and the chrome-hiding work is real.

## 4. The export button

Add a worksheet-specific button to the existing export row, following the per-view
pattern already there (`v-if="filters.viewMode === 'heatmap'"` at
`OasProgressionVueContent.vue:9`):

```vue
<v-btn v-if="filters.viewMode === 'worksheets'" outlined color="primary"
       class="oas-vue-pill-btn" @click="onWorksheetPdfExportClick">PDF Export</v-btn>
```

Keep `.oas-vue-pill-btn` — it matches Terrain's own bordered pill button, measured from
the live site (see its comment in `OasProgressionVueContent.vue`). Reuse the existing
`exportFeedback` mechanism for success/failure messaging rather than adding a second one.

No Excel export. The reference is an xlsx, but the deliverable is paper (PLAN.md scope).
Revisit only if asked.

## 5. Print-specific legibility

A worksheet is written on with a pen, which changes what "looks right" means:

- **Row height** needs to accommodate handwriting, not just text. The empty box from
  Stage 3 should be at least ~6mm tall in print.
- **Colour**: the awarded green (`#b3c9b3`) must survive greyscale printing. It is light
  enough to stay legible as grey, but confirm on an actual mono print — if it muddies the
  date text, add a thin border to carry the meaning instead of relying on fill alone.
  Note Chromium does not print background colours unless the user enables "Background
  graphics"; so **the green must not be the only carrier of meaning**. The date is
  present in every awarded cell anyway, which covers it.
- **Font size** can drop below the `--oas-vue-font-size-body` 14px in print — 9–10pt is
  normal for a form. This is a legitimate exception to the type scale (print is a
  different medium, not a drifting screen size); state it in a `@media print` block with
  a comment saying why, so it does not read as a violation of DESIGN.md's rule.

## 6. Tests

Minimal — there is little here Jest can see:

- The export button renders only on the worksheets view, and calls the export with the
  currently filtered page set (not every page).
- `worksheetOrientation` / `worksheetMembersPerSheet` persist and default correctly.
- If column splitting is implemented: splitting 20 members at 8 per sheet yields 3 column
  batches, the last with 4; `0` means no split; cells stay aligned with each batch's own
  member slice. Reuse the index-alignment reasoning from PLAN_STAGE_1.md §4a — same trap.

## Verification

All of this is manual, in Edge with `dist/` loaded. Print to PDF, and at least once to
actual paper:

- A multi-page set breaks one sheet per Skill × Stage, with no trailing blank page.
- A long stage (use the sample's 24-row `Stage 5 - Bushwalking`) breaks between rows and
  repeats its header on the second sheet.
- No Terrain chrome, filter row, tab strip or buttons on the output.
- Member columns all fit, or are split across sheets — **nothing clipped off the right
  edge**. Test with a genuinely large unit, not a three-member one; the three-member
  sample will pass regardless and prove nothing.
- Greyscale print: the awarded cells still read correctly, and with "Background graphics"
  off nothing becomes ambiguous.
- The boxes are big enough to tick with a pen. Hand the printout to the user — this is a
  judgement they should make, not one to assume.
