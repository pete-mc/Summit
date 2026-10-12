# Stage 2: Heatmap tab Excel export

Parent plan: [PLAN.md](PLAN.md). Questions answered by the user 2026-10-12.

## Status: done. Confirmed live by the user 2026-10-13, including the blank-row gaps and the white outline on the green bars.

- **Live check (user, 2026-10-13):** a full-unit (big) export worked, so the worker path is fine on Terrain. Every layout and the filters exported correctly, and the files open in all three apps.
- **Change requested (2026-10-13):** a blank row before every section after the first (skill, or member) and before every patrol group after the first within a section, because long sheets with Break by patrol were "very monotonous". Built and tested; awaiting a recheck.

- **Gaps confirmed** in the right places (2026-10-13). Spacer columns, the gap-free bars and the bold "Name — Patrol" titles are confirmed too.
- **Change requested (2026-10-13):** the complete green bar gets a white outline, the same white as the squares' borders. Without it, the white borders of squares above and below cut unevenly into the bar. Built and tested; awaiting a recheck.

## Build notes (2026-10-12)

- `npm test` passes except the known UNC smoke test. Lint is clean on the changed files, and the build succeeds.
- **Built:**
  - `OASHeatMapVue.getExportView()`; squares carry a `state`, and `stateClass` is derived from it, with the same class names as before.
  - `src/excel/sheets/skillHeatmap.ts`.
  - The Heatmap Excel Export button.
  - `runExcelExport` in `OasProgressionVueContent`, shared by Summary and Heatmap.
- **Choices made in building (to confirm):**
  - **Spacer columns:** a narrow blank column before each stage, standing in for the screen's cell padding. Without it, neighbouring stages' squares run together.
  - **Continuous bars:** no white gaps inside a bar, so a bar reads differently from a row of squares.
  - **Member-layout titles:** "Name — Patrol" sits in one bold cell. Excel cells can't mix bold and plain text through this library, so the patrol can't be lighter than the name as it is on screen.
- **Size:** a fake 60-member × 15-section unit gives 1.15 MB of sheet XML (a 163 KB .xlsx). A real full unit will therefore cross fflate's 160 KB line and compress in a `blob:` Web Worker.
  - Terrain's page sends **no Content-Security-Policy**: no header and no `<meta>` (fetched 2026-10-12). Nothing should block the worker.
  - **Still to prove live** with a full-unit export.
- **Stage 1 correction:** `EXCEL_COLOURS.headerBorder` was `#d3d9de` (a CSS fallback value), but the comment said `--summit-color-border-default`, which is really `#c8c6c4`. Now `#c8c6c4`; the Summary's header rule is very slightly darker.

## Decisions (user, 2026-10-12)

| # | Topic | Decision |
|---|---|---|
| 1 | Squares | **One cell per square**, as on screen. Each stage column is as wide as the most squares that stage has in any row exported; shorter stages leave blank cells. |
| 2 | Layout | **Follow the screen:** Group by (Skill / Member) and Break by patrol, the same as the printout. |
| 3 | Sections | **One sheet**, a title row starting each section, as on screen. |
| 4 | Skill icons | **Text only.** The section logo stays at the top. |
| 5 | Stage column | **Two number columns:** "Stage" (highest stage) and "Next" (ticks toward the next stage), so Excel can sort. A `-` on screen leaves both empty, so it sorts last. |
| 6 | I-Statement groups | **Ignored:** squares evenly spaced, no group gap. |
| 7 | Bars (fully awarded = green, not started = grey) | **Fill the whole stage column**, every cell under that stage number, so bars are all the same length. |
| 8 | Tooltips (I-Statement text, date) | **Left out.** |
| 9 | First column | Member, or Skill when grouped by member. |
| 10 | Hidden squares/bars (Show filters off) | **Blank cells**, as on screen and in the printout. |
| 11 | Title rows | Section titles grey and bold; patrol rows lighter grey; in the member layout, the member's patrol follows their name. All as on screen. |
| 12 | Header | Header block, logo and filter line use the printout's Heatmap wording (`skill-heatmap` profile + `heatmapPrintMeta`). The title block, table header and first column are frozen. |
| 13 | Button | **Excel Export** beside Print / PDF. |
| 14 | File name | `Summit - OAS Progression - Heatmap - {Unit} - yyyymmdd.xlsx` |

## Technical approach (proposal)

- **Read the heatmap's own view data, not a re-derivation.** The rows, stages, filters, sort and hidden states are all worked out in `OASHeatMapVue`'s computed properties (`allStages`, `sections`, `memberSections`).
  - The Excel builder asks the component for them through a new `getExportView()` method, the same pattern as `getExportTable()` for print. The spreadsheet then can't drift from the screen.
  - Each square view gains a plain `state` (`awarded` / `answered` / `unanswered` / `hidden`) next to its CSS class, so the builder doesn't parse class names.
- **New `src/excel/sheets/skillHeatmap.ts`.** Column widths are computed from the exported rows:
  - the first column fits the longest name or skill;
  - each stage gets `max(squares in that stage, 2)` cells. The minimum of 2 keeps an all-bar stage visible (the screen's bar has a minimum width too).
- **Colours:** existing `EXCEL_COLOURS`. Awarded is green, answered is yellow and unanswered is grey. The not-started bar is grey with a border, as on screen. The patrol-row grey (`--summit-color-bg-muted`) gets added as a fixed hex, read from `index.css` when building.
- **Size:** a wide unit (many members × 9 skills × up to ~9 stages of squares) is still well under the 160 KB background-worker threshold per file. **Measured, not assumed**, from a large fake unit in the tests.

## Tests

- Builder specs for both layouts and patrol breaks:
  - stage column widths, bars filling the whole stage column, and hidden squares blank;
  - Stage/Next numbers, and empty for `-`;
  - merged stage headers and frozen panes.
- A size check on a large fake unit.
- A render-contract test for the button.

## Live check (user)

Export with each layout (by Skill, by Skill + Break by patrol, by Member) and with some Show filters off. Open the files in your apps.
