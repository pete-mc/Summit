<!-- @format -->

# PROGRESS.md — OAS Worksheets

Status tracker across the four stages in this folder. See PLAN.md for the feature
overview and decisions; PLAN_STAGE_1..4.md for per-stage detail.

## Stage 1 — Data layer

**Done** 2026-10-01. `npm test` / `npx tsc --noEmit` / `npm run build` all green.

- New: `src/pages/OasProgression/services/getMemberDisplayName.ts`,
  `src/pages/OasProgressionVue/services/buildWorksheetPages.ts`.
- Extracted `getMemberDisplayName` out of `OASHeatMapVue.ts` (was a private
  `displayName` function) so the heat map and worksheet resolve codenames/hidden
  last names identically.
- Exported `skillTitle`/`formatStream` from `OASHeatMapVue.ts` and
  `lastNameOf`/`firstNameOf` from `filterHeatMapSections.ts` for worksheet reuse.
- Made `filterMembersByPatrol`/`groupMembersByPatrol` generic over `{ patrolName }`
  instead of hard-typed to the heat map's `SectionMemberRow`, so `WorksheetMember`
  (a narrower shape) can reuse them directly rather than being force-fit with fake
  heat-map-only fields. A deliberate deviation from the plan's own draft code, which
  had sketched unsafe casts instead — see PLAN_STAGE_1.md §2 for why that's wrong.
- 19 new tests in `tests/unit/pages/OasProgressionVue/services/buildWorksheetPages.spec.ts`.

Not yet verified live in the browser — no UI exists yet at this stage (by design).

## Stage 2 — View switcher (`v-tabs`)

**Done** 2026-10-01, including live verification. `npm test` / `npx tsc --noEmit` /
`npm run build` all green.

- Replaced the "Show Table"/"Show Heatmap" button in `OasProgressionVueContent.vue`
  with a Vuetify `v-tabs` strip, matching Terrain's captured Programming-page tab
  styling (`grow`, `height="40"`, `color="primary"`, `background-color="grey
lighten-5"`).
- `OasProgressionVueContent.ts`: `onToggleViewModeClick` → `onViewModeTabChange`;
  added exported `sanitiseViewMode` so a corrupted/future-version persisted
  `viewMode` falls back to `"heatmap"` instead of selecting nothing.
- Updated `oas-progression-vue-render-contract.spec.ts`, which had source-text
  assertions pinning the old button's exact wording from a prior stage — rewritten
  to assert the new tab contract instead of leaving stale coverage.
- New `tests/unit/pages/OasProgressionVue/components/OasProgressionVueContent.spec.ts`
  (6 tests).

### Bug caught live, fixed same day: tab selection always landed on Table

**Symptom** (user-reported, live browser test): clicking either tab never changed
the view — it always showed Table.

**Root cause**: `<v-tab value="heatmap">` — Vuetify 2's `v-tab` has **no `value`
prop**. `value` on `v-tab` is a read-only *computed* (falls back to `to`/`href`,
else the tab's own index — see `node_modules/vuetify/lib/components/VTabs/VTab.js`).
The real identity prop is `tab-value`. A plain `value="heatmap"` attribute was
therefore silently dropped as unrecognised, and `VItemGroup.getValue()`
(`item.value === undefined ? i : item.value`) fell back to each tab's index. Since
`filters.viewMode` is the string `"heatmap"`/`"table"`, it never matched either
tab's real (index-based) identity, so Vuetify's mandatory-selection logic always
landed on the same tab regardless of which one was clicked.

**Fix**: `tab-value="heatmap"` / `tab-value="table"`, with a comment above the
`<v-tabs>` block in `OasProgressionVueContent.vue` explaining the trap so it isn't
"corrected" back by someone who hasn't read Vuetify's source. Also corrected in
PLAN_STAGE_2.md's own code sketches (which had the same mistake) and in the
render-contract test (which was asserting the broken markup).

**Worth remembering if `v-tabs` is used anywhere else in Summit later.**

**Live verification, confirmed by the user 2026-10-01**: tab styling correct for
active/inactive/hover states; selection now changes the view and persists across a
reload.

## Stage 3 — Worksheet view

**Implemented** 2026-10-01, not yet verified live. `npm test` (745/746 — the 1 failure is the
pre-existing UNC smoke test) / `npx tsc --noEmit` / `npm run build` all green.

- Widened `viewMode` to `"heatmap" | "table" | "worksheets"` in
  `OASProgressionVueFilterPersistence.ts`, which also now carries six `worksheet*` filter keys,
  independent of the heat map's own (see that file's comment for why — different jobs, shouldn't
  cross-narrow each other).
- New: `OASWorksheetFiltersVue.vue`/`.ts` (Skills, Stage from/to, Use codenames, Hide last name,
  Break by patrol, Hide completed, Reset) — a separate component from `OASProgressionFiltersVue`,
  not a reuse, per the plan's §3 rationale.
- New: `OASWorksheetsVue.vue`/`.ts` — one plain `<table>` per `WorksheetPage`, with a sticky
  group-band + statement column, three-state cell rendering (empty tick-box / dated / dated+green),
  and patrol-span column headers.
- `OasProgressionVueContent.vue`/`.ts`: third tab wired in (labelled "Worksheets"), the three-way
  view switch moved from `v-if`/`v-else-if` to explicit `v-if`s per the plan, Table's Excel/PDF
  export buttons now correctly gated to `viewMode === 'table'` only (not a bare `v-else`, which
  would have also caught `'worksheets'`).
- New tests: `OASWorksheetsVue.spec.ts` (11 tests — cell-class mapping, date formatting,
  `pageSet`/`hasPages` wiring, patrol-span column alignment). Extended
  `OasProgressionVueContent.spec.ts` and `oas-progression-vue-render-contract.spec.ts` for the
  third tab and the worksheet-specific filter keys.

### A real design gap found and fixed while implementing: "break by patrol" needed to reorder columns, not just label them

The plan's §4 said member columns should be "ordered by patrol with a patrol label... spanning
each patrol's columns" — but Stage 1's `buildWorksheetPages` only ever sorted `members` by
first/last name and built `patrolGroups` as a *separate* grouped view of the *same* (still
name-sorted) list. Columns on the actual table come from `members`' own order, so a patrol-span
header built from `patrolGroups` would have silently disagreed with the column order beneath it
the moment a patrol's members weren't already contiguous in name order.

**Fixed in `buildWorksheetPages.ts`**: added `orderMembersByPatrol()`, which flattens
`groupMembersByPatrol`'s grouping back into one ordered list (patrol-alphabetical, Unassigned
last, name order preserved within each patrol). `buildMemberList` now applies this to `members`
itself when `breakByPatrol` is on, so `patrolGroups` (built from that same ordered `members`) is
guaranteed consistent with it. Added a regression test
(`reorders member COLUMNS by patrol when breakByPatrol is on...`) asserting the two stay in lockstep.

### Live verification, 2026-10-01 — confirmed by the user

- Data shown correctly against a real unit.
- All filters and display options work.
- **Found live**: "Break by patrol" gave no visual distinction between patrol columns beyond the
  spanning header label — once scanning a few rows down, it was impossible to tell which member a
  column belonged to. User suggested shading, similar to the I-Statement column.

  **Fixed same day.** Added `patrolTintClassesForPage()` (alternating `--summit-color-bg-muted`
  tint per PATROL GROUP, not per column, so a whole patrol reads as one block) and
  `isPatrolGroupStart()` (a left-border divider at each group's first column, matching the
  `istatement-group-start` convention — visible even where the tint alone is too subtle, e.g.
  greyscale print or a single-patrol page). Both applied to member-header `<th>`s and every body
  `<td>` in that column. The awarded-green state still wins over the tint on a cell that is both
  (awarded is the stronger, more meaningful signal) — the CSS rules are ordered so this holds by
  source order, not left to specificity accident. 4 new tests in `OASWorksheetsVue.spec.ts`.

Not yet checked live: hard-refresh directly onto the page's own URL (sticky-cell backgrounds are
the specific DESIGN.md risk that only shows on a cold load) — worth a final pass once Stage 4 print
output is also ready to check in the same session.

## Stage 4 — Print/PDF

**Implemented** 2026-10-01, not yet verified live (this stage explicitly cannot be verified any
other way — see PLAN_STAGE_4.md's own note). `npm test` (765/766 — the 1 failure is the
pre-existing UNC smoke test) / `npx tsc --noEmit` / `npm run build` all green.

### Deviated from the plan, by design, after checking first

The plan asked to verify `exportElementToPdf` before committing to it — done, and it turned out
unsuitable: it rasterizes its one element to a single canvas/JPEG and slices that into pages
(fine for the heat map's one wide table, wrong for 17 independent tables each needing a real
repeating `<thead>`), and its section-break logic is hardcoded to the heat map's own CSS classes
(`.oas-heatmap-skill-title-row` etc). A bitmap also can't honour `display: table-header-group`.

**Built instead**: `src/pages/OasProgressionVue/services/printWorksheets.ts` — opens the
Worksheets view's already-rendered `<table class="oas-worksheet-page">` elements (cloned via
`outerHTML`, not rebuilt from data a second time) in a brand-new window with a small
self-contained print stylesheet, then calls `print()` there. A `printed` guard stops both the
`onload` and the timeout fallback from calling `print()` twice if both fire.

**Consequence**: the plan's §3 ("hiding Terrain's chrome is the hard part") does not apply — a
brand-new window never contains Terrain's chrome in the first place, so there was no cascade fight
to have and no `.oas-worksheet-no-print` CSS needed anywhere.

**Not implemented, per the plan's own escape hatch**: column-splitting across sheets for a unit
too large for either orientation. Instead: `pageExceedsColumnLimit()` (portrait ≤7, landscape ≤13,
the plan's own rule-of-thumb numbers) drives an on-screen warning banner when any page would be
squeezed — flagged, never silently clipped. If a real large unit needs this, it's a follow-up.

### What shipped

- `OASProgressionVueFilterPersistence.ts`: added `worksheetOrientation: "portrait" | "landscape"`
  (default `"landscape"`). No `worksheetMembersPerSheet` key — that was only for the
  not-implemented splitting.
- `OASWorksheetFiltersVue` gained a "Print orientation" select.
- `OASWorksheetsVue`: `pageExceedsColumnLimit()` (exported, independently tested),
  `hasOverflowingPages` computed, the warning banner, and `printCurrentPages()` (reads the live
  DOM's rendered tables, hands them to `printWorksheets`).
- `OasProgressionVueContent.vue`/`.ts`: a "Print" button on the Worksheets tab
  (`onWorksheetPrintClick`), calling the child via `ref="worksheets"` — same pattern as the heat
  map's own `ref="heatMap"` / `getExportTable()`. Shows feedback if the popup was blocked.
- New tests: `printWorksheets.spec.ts` (6 — popup-blocked handling, written markup, orientation,
  the double-print guard), plus `pageExceedsColumnLimit`/`hasOverflowingPages` tests added to
  `OASWorksheetsVue.spec.ts`, plus 6 new render-contract assertions.

### Live verification, 2026-10-01 — confirmed by the user

- One sheet per Skill × Stage worked, no blank pages.
- The new-window print approach (vs. browser print on the live page) was well received — gives
  the user normal browser print-dialog control over orientation/paper size.

**Three issues found live, fixed same day:**

1. **The print window didn't reliably come to the front**, and had no way to close it short of
   minimising the main browser. Fixed in `printWorksheets.ts`: `focus()` is now called immediately
   when the window is opened (not only right before `print()`), and the written document now
   includes a visible "Close this window" button (`window.close()` — reliable here specifically
   because the window was opened by this same script, which is exactly when that call is allowed).
   The button is hidden in `@media print` so it never appears on the printed page itself.

2. **Patrol shading made identical (unanswered) cells look like different colours between
   patrols**, which read as meaningful when it wasn't. Replaced the alternating background tint
   entirely with a thicker (3px, `--color-medium-charcoal`) border around each patrol's own block
   of columns — left edge of its first column, right edge of its last — applied to the patrol
   header cell itself too (previously only the member-header row had any patrol-boundary
   treatment). `patrolTintClassesForPage`/`isPatrolGroupStart` were removed and replaced by a
   single `patrolBorderClassesForPage()` returning `{start, end}` per column. No cell's own
   background is touched by patrol grouping any more — only the cell's own state
   (empty/answered/awarded) ever sets a background now.

3. **No way to test a large unit.** Generated two static HTML fixtures (landscape + portrait) from
   a synthetic 40-member, 4-patrol dataset, reusing the REAL `buildWorksheetPages` output and the
   real `buildPrintStylesheet()` (now exported from `printWorksheets.ts` for this reason) so the
   preview's borders/colours/cell states genuinely match what ships — only the `<table>` markup
   assembly was hand-written, mirroring `OASWorksheetsVue.vue`'s own template. Saved to
   `P:\Dev\personal\terrain_summit\resources\large-unit-fixture-{landscape,portrait}.html` — open
   either directly in a browser, no extension or Terrain needed. The generator script itself was a
   throwaway Jest spec, run once and deleted (not part of the permanent suite).

Tick boxes confirmed fine as-is — no change needed.

### Not yet verified live

- The popup-blocked feedback message (needs an actual popup blocker to trigger, not just code
  review).
- Greyscale print: awarded green still reads, "Background graphics" off doesn't create ambiguity.

### Second round of live feedback, 2026-10-01 — three more findings

1. **Confirmed fixed**: print window focus (turned out to be Edge/window-manager behaviour on the
   user's machine, not a real bug — "always in front" prevented any other window, Explorer
   included, from showing).

2. **Patrol border too thick/intrusive.** The 3px `--color-medium-charcoal` border from the first
   round of feedback was itself too strong. **Fixed**: now matches the table's own existing sticky
   column dividers exactly — `--summit-color-border-default`, 2px — rather than a second, visually
   competing "stronger" colour. Updated in both `OASWorksheetsVue.vue` and `printWorksheets.ts`'s
   mirrored print stylesheet.

3. **The 40-member fixture failed to print properly — this is the important one.** Printed for
   real (both landscape and portrait PDFs), the table silently clipped ~27 of 40 member columns
   off the right edge of the page, with no second sheet. Screenshots confirmed via PyMuPDF
   (installed this session for PDF rendering, since poppler/pdftoppm isn't available here) showed
   this is exactly the failure Stage 4's warning banner was supposed to prevent from being
   silent — it wasn't a near-miss, the data genuinely was not retrievable from the printed sheet.

   **This is a real design gap, not a one-line fix.** Discussed with the user and planned properly
   as **`PLAN_STAGE_5_LARGE_UNITS.md`** rather than patched ad hoc:
   - A new **transposed layout** ("members as rows, I-Statements as columns" — Topo calls this
     "Like Terrain"), which scales to any unit size since rows just grow the page downward instead
     of needing more width. User-selectable, not a replacement for the current layout.
   - The **current layout** gains two text-rotation treatments (group-band, member names) to buy
     more columns before splitting is needed, and **real column-splitting across extra sheets**
     when even that isn't enough — the column-splitting Stage 4 explicitly deferred, now actually
     needed because a warning alone proved insufficient once tested for real.
   - **Portrait is dropped entirely** — always landscape, per the user's explicit direction.
   - One open design question was resolved before any code was written: a full I-Statement
     sentence cannot fit in a rotated column header even sideways. Decided with the user: the full
     text stays (no numbering/legend, no abbreviation), with the font scaled down to fit — one
     font size per page (sized to the page's own longest statement), not per-column independent
     sizing, and column width divided evenly across the page rather than split onto more sheets.

   See `PLAN_STAGE_5_LARGE_UNITS.md` for the full design. Not yet implemented — next up.

**Lesson worth stating plainly**: Stage 4's warning-banner mitigation for column overflow was
accepted on the strength of the plan's own reasoning, without an actual print test of a large unit
at the time (the 40-member fixture that would have caught this was built and printed only in this
follow-up round). The gap between "should work, per the design" and "does work, confirmed by
printing it" is exactly what surfaced here — worth remembering before accepting a similar
flag-not-fix tradeoff on faith again.

## Stage 5 — Transpose layout + real column splitting

**Implemented** 2026-10-01, per `PLAN_STAGE_5_LARGE_UNITS.md`. `npm test` (793/794 — the 1 failure
is the pre-existing UNC smoke test) / `npx tsc --noEmit` / `npm run build` all green.

### Before building: two more decisions resolved with the user, not guessed

1. **Patrol border, round 2.** The 3px `--color-medium-charcoal` fix from the first round of
   feedback was itself judged too thick. Toned down to match the table's own existing sticky-column
   dividers exactly (`--summit-color-border-default`, 2px).
2. **Transposed column header text.** A full I-Statement cannot fit in a rotated column header even
   sideways. Decided: keep the FULL text (no numbering/legend, no abbreviation), scale the FONT down
   to fit instead — one size per page (sized to that page's own longest statement, not per-column
   independent sizing), column width divided evenly across the page.

### What shipped

- **`buildWorksheetPages.ts`**: `splitPageIntoColumnBatches()` (Layout A's real column-splitting,
  replacing Stage 4's warning-only mitigation — same index-alignment discipline as "Hide completed"
  §4a) and `transposeWorksheetPage()` (Layout B's pure reshape — I-Statement rows become columns,
  members become rows, with contiguous `groupSpans` for the Plan/Do/Review/Verify header).
- **New `fitRotatedHeaderFont.ts`**: binary-searches the largest font size whose longest-statement
  rendering fits a budgeted header height, via offscreen canvas `measureText` (falls back to a
  rough character-count estimate where canvas isn't available, e.g. this repo's jsdom test
  environment — confirmed the fallback still produces a usable fixture, see below).
- **New `worksheetPrintPageSize.ts`**: the one shared source for A4-landscape-derived sizing
  constants (usable width, `MAX_FITTING_MEMBER_COLUMNS` for Layout A, transposed column width and
  font-size bounds for Layout B) — both the component and `printWorksheets.ts`'s margin now read
  from this instead of two independently-chosen numbers.
- **`OASProgressionVueFilterPersistence.ts`**: `worksheetOrientation` removed entirely, replaced by
  `worksheetLayout: "membersAsColumns" | "membersAsRows"`. Printing is unconditionally landscape now
  (`buildPrintStylesheet()` takes no parameter) — portrait was dropped per the user's direction.
- **`OASWorksheetFiltersVue`**: the orientation select replaced by a "Layout" select.
- **`OASWorksheetsVue.ts`/`.vue`**: both layouts fully rendered — Layout A with rotated group-band/
  member-name headers (`writing-mode: vertical-rl`) and real multi-sheet splitting; Layout B with
  the transposed table, rotated+font-fitted I-Statement headers, and a patrol DIVIDER ROW (not a
  column span — members are rows here) via `patrolDividerBeforeRow()`. The old "squeezed/clipped"
  warning banner is gone, replaced by an informational "prints across more than one sheet" note
  that only fires when Layout A's splitting actually engaged (`hasSplitPages`).
- Extensive new/updated tests across all the above — `fitRotatedHeaderFont.spec.ts` (5),
  `buildWorksheetPages.spec.ts` additions (12 for splitting/transpose), `OASWorksheetsVue.spec.ts`
  rewritten sections (layout switching, both page-list computeds, the split-note computed, the row
  patrol divider), `printWorksheets.spec.ts` updated for the dropped orientation parameter, plus 5
  new render-contract assertions.

### Verified before handing back to the user — the step skipped last time

Learning directly from the Stage 4 mistake: **did not hand this back on the strength of tests
alone.** Installed PyMuPDF (already done for the Stage 4 bug) and used Playwright (pointed at the
machine's installed Edge via `channel: "msedge"`, since the sandboxed Chromium wasn't downloaded)
to actually render both layouts to PDF from real print CSS and inspect the pages:

- **Layout A**: 40 members split cleanly into 4 sheets of 10 each (`MAX_FITTING_MEMBER_COLUMNS`
  calculated to 10 — lower than Stage 4's original un-rotated 13, confirming
  `worksheetPrintPageSize.ts`'s own comment that rotating the header doesn't buy more columns, only
  a narrower header). Every member visible, title suffix ("members 1-10 of 40" etc.) correct, group
  band and member names legible rotated sideways, awarded cells green, nothing clipped.
- **Layout B**: all 9 I-Statement columns fit one page width as rotated headers, legible even using
  the FALLBACK character-estimate font sizer (no real canvas in the Node/jsdom environment used to
  generate the fixture — a real browser's canvas measurement should do at least as well). 40 members
  as rows across 3 sheets (vertical overflow only, which is expected and fine — rows are unbounded
  by design). Patrol divider rows ("Kookaburras", "Wombats", etc.) appear correctly between patrol
  groups.
- One throwaway fixture-generator bug caught and fixed in the process: an early version's own
  hand-rolled patrol-divider logic was wrong (always compared against `undefined` on the first
  row in a way that didn't actually track the previous row's patrol correctly), which looked like a
  product bug until traced — direct testing of the real `buildWorksheetPages`/
  `transposeWorksheetPage` functions confirmed patrol ordering/grouping is correct; only the
  generator script's own duplicate logic was wrong. Fixed in the regenerated fixture.

Static fixtures saved for the user to review or re-print at
`P:\Dev\personal\terrain_summit\resources\large-unit-fixture-v3-layoutA-columns.html` and
`...-v3-layoutB-rows.html` (open directly in a browser, no extension needed). The two Stage-4-era
fixtures (landscape/portrait, pre-dating the split fix) were deleted as obsolete.

### Still needs the user's own live check

- Real canvas-based font sizing in an actual browser (the fixture used the jsdom fallback) — should
  be at least as good, worth a quick look once Summit itself is loaded in Edge.
- `ROTATED_HEADER_HEIGHT_PX` (220px) and the font-size floor (6px) are stated, not measured against
  a real print — PLAN_STAGE_5_LARGE_UNITS.md §2 flagged both as worth revisiting empirically.
- `MAX_FITTING_MEMBER_COLUMNS` (10, calculated) replaces Stage 4's two empirically-validated
  portrait/landscape numbers with one calculated number — worth one real print to confirm 10 columns
  actually looks right, not just arithmetically fits.
- The actual Worksheets tab inside the real extension (`dist/` loaded in Edge) — everything above
  was verified via the static fixture + Playwright/Edge PDF rendering, not the live Summit page
  itself.

## Layout A fixes, round 2 — print CSS, GUI de-rotation, small-unit gap, dev toggle

**Implemented** 2026-10-02, per `.claude/plans/witty-leaping-gem.md` (plan-mode session). `npm test`
(801/802 — the 1 failure is the pre-existing UNC smoke test) / `npx tsc --noEmit` / `npm run build`
/ `npm run lint` all clean.

Triggered by live testing of the 40-member fixtures from the previous round. Four items, each
investigated by reading the real code/CSS before touching anything, per the user's own "confirm
and ask me" / "let me know before fixing" instructions:

1. **Dates wrapped in print.** Neither stylesheet set `white-space: nowrap` on the date span.
   Fixed in both.
2. **"Date font looks bigger than I-Statement font."** Checked first: both already use the exact
   same `font-size` in both stylesheets (14px screen / 10pt print). Reported back rather than
   changed — the user agreed it's visual (a short, dense date next to wrapped prose).
3. **I-Statements should wrap at ~50 characters, no mid-word splits.** The statement column
   previously had only a soft `min-width`/`max-width` range, so wrapping happened at whatever width
   the table layout gave it, not a predictable character count. Derived (not eyeballed) a real
   `width` for each stylesheet from "50 chars × ~0.5em average glyph width" at each surface's own
   font size — `STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX`/`..._PRINT_PX` in the new
   `worksheetPrintPageSize.ts`. `white-space: normal` alone (no `overflow-wrap`/`word-break`) was
   already word-wrap-only — confirmed, not assumed.
4. **GUI-only: stop rotating Plan/Do/Review/Verify.** Confirmed with the user first: print keeps
   rotating it (the whole reason it was rotated for Stage 5 — more columns fit on a physical page);
   only the screen stops. Done via a GUI-only CSS override
   (`.oas-worksheet-group-band .oas-worksheet-rotated-text`) in the component's own scoped
   `<style>`, leaving `printWorksheets.ts`'s separate, independent stylesheet untouched. The
   group-band column widened from 28px to 70px on screen to fit "Review"/"Verify" horizontally
   (print's own copy stays at 28px rotated).

### The empty-gap bug — my first diagnosis was wrong, caught by the user's own screenshot

Before the user's screenshot, the "let me know before fixing" gap item was diagnosed (wrongly) as
a sticky-offset mismatch from an unconstrained title cell. The user's actual screenshot (a
3-member unit, Terrain's live OAS Progression Worksheets tab) showed something different: a large
blank horizontal band between the I-Statement text and the member columns, which sat pushed to the
far right of the browser window — not misaligned content, empty space.

**Real root cause**: `.oas-worksheet-page { width: max-content; min-width: 100%; }`. `min-width:
100%` forced the table to fill the viewport regardless of column count. A large unit never
noticed (real content already exceeds the viewport). A small unit's few narrow fixed-width columns
left the table far short of 100%, and the only flexible column (the statement column's old soft
min/max-width range) absorbed all the slack — stretching hundreds of pixels past its own stated
max-width, which is exactly the blank band in the screenshot.

**Fixed**: removed `min-width: 100%` (table now always sizes to `max-content`), combined with
giving the statement column (item 3 above) a real enforced `width` instead of a soft range — once
that column has nothing ambiguous to stretch into, the mechanism that created the gap is gone
entirely. A related latent version of the same mechanism (the page-title `colspan="2"` cell having
no width cap, which could force columns 1+2 wider than their own stated widths for a long title)
was fixed alongside it with a scoped `max-width`/`white-space: normal` override — scoped to a new
`.oas-worksheet-page-title` class so it doesn't affect Layout B's own differently-shaped group-span
header cells, which share the base `.oas-worksheet-group-header` class.

### New: temporary dev toggle to preview a large unit on screen

Requested directly off the same screenshot — a way to check small-vs-large layout side by side in
the real running GUI, not just the separate static HTML fixtures. Implemented as a `localStorage`
flag (no UI control, no build-time flag — see the plan's own reasoning for why), inlined into
`OASWorksheetsVue.ts`'s `pageSet` computed:

```js
localStorage.setItem("summit.oasWorksheetsVue.devDuplicateMembers", "10")
```

Duplicates every real member that many extra times (distinct synthesized `memberId`/`memberName`,
everything else identical) before building the page set. `0`/absent (the default) passes `items`
through unchanged. Marked `TEMPORARY DEV AID` with a "delete this whole block" note in the code —
not meant to ship long-term. `readDevDuplicateCount`/`duplicateMembersForDevPreview` exported for
direct testing (8 new tests).

### Verified before handing back — real print AND real screen CSS, both checked

Same discipline as the previous round's lesson (don't hand off on tests alone): regenerated three
fixtures and rendered them for real via Playwright against the machine's installed Edge —

- **Print stylesheet, 3-member unit** (the exact screenshot case): gap confirmed gone, dates don't
  wrap, I-Statement text wraps cleanly at word boundaries. Group-band correctly still rotated
  (print's own confirmed-unchanged behaviour).
- **Print stylesheet, 25-member unit**: splits into 3 sheets at 9 columns each (the new, lower
  `MAX_FITTING_MEMBER_COLUMNS`, since the wider ~50-char statement column leaves less room per
  sheet than the old narrower one — a direct, expected consequence of item 3, not a regression).
  Nothing clipped, long statement wraps across 3 lines without mid-word splits.
- **Screen CSS specifically** (extracted the component's own `<style scoped>` block and rendered
  it standalone, since the print fixtures above only exercise `printWorksheets.ts`'s separate
  stylesheet): confirmed Plan/Do/Review/Verify reads horizontally and the gap is gone on screen too.

Fixtures saved at `P:\Dev\personal\terrain_summit\resources\` for the user's own reference:
`gap-fix-check-small-unit.html` / `gap-fix-check-large-unit.html` (print stylesheet) and
`gap-fix-check-SCREEN-CSS.html` (screen stylesheet, standalone). The generator scripts themselves
were throwaway Jest specs, run once and deleted.

### Not yet verified live

- The actual Worksheets tab inside the real extension, hard-refreshed on Terrain itself — the
  checks above used static/standalone fixtures, not the live Summit page.
- The dev toggle itself, tried by the user in the real GUI (code-reviewed and unit-tested, not yet
  exercised by a human in the browser).

## Layout A fixes, round 3 — adaptive column widths (member columns fill available width)

**Done** 2026-10-02. `npm test` (816/817, the 1 pre-existing UNC-path smoke failure unrelated —
see DEVENV.local.md) / `npx tsc --noEmit` / `npm run lint` / `npm run build` all green.

Requested live: member columns should fill the available screen/page width as much as possible,
and the I-Statement column should only wrap once a page actually needs to split onto more sheets —
both on screen and in print. Previously `MAX_FITTING_MEMBER_COLUMNS` was ONE fixed global constant
(squeezed numbers baked in), applied to every page regardless of its own member count, so a small
unit always rendered with bare-minimum 70px member columns and a tightly-wrapped ~50-char statement
column even though nothing forced it to.

**Design**: `worksheetPrintPageSize.ts` gained `maxFittingMemberColumns(usableWidthPx,
groupBandWidthPx, statementWidthPx)` (a function, replacing the old single constant — still used to
compute the pre-existing `MAX_FITTING_MEMBER_COLUMNS` for print) and
`computeColumnsLayoutMetrics(usableWidthPx, groupBandWidthPx, memberCount,
relaxedStatementMaxWidthPx)`, which returns the actual statement/member-column widths to render a
given page at: relaxed (420px statement ceiling, member columns stretched evenly into whatever's
left) when there's room, falling back toward the squeezed ~50-char wrap width only once a page's
member count leaves no slack. A page only SPLITS once it doesn't fit even at the fully squeezed
numbers — exactly the old threshold, just computed per-surface now instead of print-only.

- **Print**: budget is still the fixed `PRINT_USABLE_WIDTH_PX` (a physical A4 sheet never changes
  size). `OASWorksheetsVue.ts`'s `printCurrentPages()` clones each live table and rewrites its
  `.oas-worksheet-statement`/`.oas-worksheet-cell` inline widths to print's own metrics
  (`rewriteColumnsLayoutWidthsForPrint`) before handing off — needed because the live screen DOM's
  inline widths are sized against the SCREEN's own measured width, which has no relationship to an
  A4 sheet's fixed budget, and `printWorksheets.ts` clones `outerHTML` verbatim.
- **Screen**: no fixed width exists to calculate against — added a `ResizeObserver` on the
  component's root element (new machinery; confirmed by grep that nothing else in `src/` measures
  layout this way), writing into a new `screenAvailableWidthPx` data property that
  `columnsLayoutPages` feeds into the same width formula. Before the observer's first measurement
  (width 0), falls back to `PRINT_USABLE_WIDTH_PX` for that one pre-mount render rather than feeding
  0 straight in (0 would make `maxFittingMemberColumns` go `<= 0`, which `splitPageIntoColumnBatches`
  treats as "don't split at all" — the opposite of the intended safe default).
- `columnsLayoutPages` now returns `ColumnsPageView[]` (`{ page, statementWidthPx,
  memberColumnWidthPx }`) instead of a bare `WorksheetPage[]`, mirroring how Layout B's
  `rowsLayoutPages`/`TransposedPageView` already bundles per-page computed values — the template
  binds these as inline `:style` on `.oas-worksheet-statement`/`.oas-worksheet-cell`, the same two
  selectors the old fixed CSS rules targeted (those rules are now fallbacks only, since inline
  styles win regardless of selector specificity).

**Verified**: new `worksheetPrintPageSize.spec.ts` (direct tests of both new functions) plus
extended `OASWorksheetsVue.spec.ts` coverage (small page → relaxed statement width + member columns
wider than 70px; a batch at the exact fitting threshold → forced back to 70px/squeezed; the
pre-mount fallback; `rewriteColumnsLayoutWidthsForPrint` clones rather than mutates). Regenerated a
throwaway fixture (3-member and 25-member units) through the real `buildPrintStylesheet()` +
`computeColumnsLayoutMetrics` path and rendered it via the established Playwright+Edge PDF route:
3-member case renders member columns at ~199px (vs the old fixed 70px) and the statement column
unwrapped at its full 420px; the 25-member case still splits at 9/sheet with columns correctly
pinned back to 70px/389px (the ~50-char-ish squeezed range) once a page is actually at capacity.

**Not yet verified live**: the real extension in Edge at a few different browser window widths
(screen-only, resize-reactive behaviour that a static fixture render can't fully exercise) — ask the
user to hard-refresh the Worksheets tab and resize the window to confirm member columns visibly
widen/narrow as the window does, for both a real small unit and, via the existing dev toggle, a
synthetic large one.
- `MAX_FITTING_MEMBER_COLUMNS` dropping from 10 to 9 — small, expected, but worth a glance.

## Layout A fixes, round 4 — split-batch width consistency (GUI) + print re-splitting from scratch (print)

**Done** 2026-10-02. `npm test` (828/829, the 1 pre-existing UNC-path smoke failure unrelated) /
`npx tsc --noEmit` / `npm run lint` / `npm run build` all green.

Live testing of round 3's adaptive widths (via the dev toggle, 33 synthetic members) surfaced two
bugs, reported with a real printed PDF attached:

### GUI bug — split batches didn't line up

When a page split into multiple batches (e.g. screen fits 29 of 33 members on sheet 1, 4 on sheet
2), `columnsLayoutPages` computed `computeColumnsLayoutMetrics` PER BATCH, using that batch's own
(smaller, for the trailing batch) member count — the smaller batch had more slack, so its columns
stretched visibly wider than sheet 1's, and the two tables no longer lined up under each other.

**Fix**: compute one set of widths per ORIGINAL page (from its first/largest batch — batches are
now sized evenly, so the first is always the largest or tied for it) and apply that SAME width to
every batch of that page. Also fixed `splitPageIntoColumnBatches` itself (`buildWorksheetPages.ts`)
to size batches evenly (`ceil(33/2)` = 17/16, not a literal 29-then-4-remainder) — a lopsided last
batch was the direct cause of the mismatched widths in the first place.

### Print bug — splitting didn't happen at all, columns clipped

The real, more serious bug: print was never re-deriving its own column batches — `printCurrentPages`
only re-STYLED whatever table(s) the SCREEN had already split into (sized against the screen's own,
much wider, measured width), so a 33-member unit that fit entirely on one wide-monitor screen table
got squeezed onto a single A4 sheet with print's narrow 70-333px widths — not re-split — clipping
most members off the printable area entirely (visible in the user's attached PDF: only ~19-23
columns actually printed per sheet, out of 33, and some I-Statement text wrapped far tighter than
the requested ~50 characters since the statement column was also squeezed down without re-flowing).

**Fix**: new `splitTableColumnsForPrint(table, maxColumns)` in `OASWorksheetsVue.ts`, replacing the
old `rewriteColumnsLayoutWidthsForPrint`. Re-splits each live table's own member columns (by DOM
index, not by rebuilding HTML from `WorksheetPage` data again — keeps Stage 3's exact rendering,
patrol tints included, reproduced faithfully rather than re-derived a second time) into AS MANY
print-sized batches as print's own `maxFittingMemberColumns(PRINT_USABLE_WIDTH_PX, ...)` actually
requires, independently of how the screen happened to batch it. Handles the optional patrol-header
row's `colspan`s correctly — a patrol span can straddle a print-batch boundary in a way it never did
at the screen's wider batch size, so each span is clipped/recomputed against the new column range
rather than carried over unchanged.

A further wrinkle: a table being re-split for print might ALREADY be one of several screen-split
batches of a larger page (print re-splitting an already-29-member screen batch further still) — its
own local member count/title ("members 1-29 of 33") isn't the true original total. Added
`data-oas-worksheet-member-offset`/`data-oas-worksheet-member-total` attributes (set from two new
fields on `columnsLayoutPages`'s own per-batch view object) so print always renumbers its own
sub-batches against the TRUE original page, not whatever the screen's own batch happened to be
locally — confirmed via a dedicated test that re-splitting an already-suffixed title doesn't double
up the "(members X-Y of Z)" suffix.

**Verified**: extended `buildWorksheetPages.spec.ts` for the even-split change; rewrote the
`OASWorksheetsVue.spec.ts` print-width tests entirely around `splitTableColumnsForPrint` (17 new
tests: re-splitting math, patrol-colspan recomputation, offset/total renumbering, no double-suffix,
clone-not-mutate); added `columnsLayoutPages` tests confirming every batch of a split page now
shares identical widths. Built an end-to-end throwaway test reproducing the exact reported
scenario — 33 members fitting on one simulated wide-screen table, then run through the real
`printCurrentPages()` call path — confirming it now correctly re-splits into multiple print-sized
batches with nothing lost (33 members total preserved across all resulting tables), then rendered
that output to PDF via the established Playwright+Edge route and visually confirmed no clipping.

**Verified live by the user** 2026-10-02, in the real extension against a real large unit (both the
GUI split-alignment fix and the print re-splitting fix) — confirmed working as expected ("99% like
what I imagined"). Layout A ("members as columns") is considered done for now; Layout B ("members
as rows") is next.
