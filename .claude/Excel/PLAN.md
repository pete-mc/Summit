# Plan: Formatted Excel export (`summit-excel`), starting with OAS Progression → Summary

Status: **Stages 0 and 1 done (2026-10-12). Stage 2 (Heatmap) in progress.** See [PLAN_STAGE_0.md](PLAN_STAGE_0.md), [PLAN_STAGE_1.md](PLAN_STAGE_1.md) and [PLAN_STAGE_2.md](PLAN_STAGE_2.md).

## What exists today (checked in the code, 2026-10-12)

- `src/components/gridExport.ts` → `exportGridToExcel()`: a plain data dump through **SheetJS `xlsx` 0.18.5**. One sheet, no formatting.
  - Used by the OAS **Table** tab, **Present Awards**, and the React DataGrid pages (Milestone Report, OAS Report, Peak Award, Unit Summary).
- The **Summary** tab has no Excel export today.
- The free SheetJS build **cannot write cell styles**, so "nicely formatted" needs a different library.
- `npm audit` flags `xlsx` 0.18.5 as **high**: prototype pollution and ReDoS. Both are in *reading* files and Summit only writes, so the practical risk is low.
- Topo (reference) uses Syncfusion XlsIO server-side (commercial, .NET). Not reusable.

## Decisions (user, 2026-10-12)

| # | Topic | Decision |
|---|---|---|
| 1 | Library | **write-excel-file** (4.1.1, maintained June 2026). Trialled in Stage 0 first. ExcelJS was rejected because its extras (hover notes, in-file print setup) aren't wanted. |
| 2 | Box cells | **Coloured cells, one per box.** Each skill is several narrow columns under a merged skill header ("Core Skills" merged over Bushcraft / Bushwalking / Camping, as on screen). |
| 2b | Fully-met skill | **Separate cells, all green**, not merged into one bar. |
| 2c | Progressions / Special "X of Y" | **A text cell after the box cells**, as on screen. |
| 3 | Colours | **Same as screen:** green `#004c00` = all met (`--summit-color-status-awarded`), yellow `#ecb206` = met (`--summit-color-status-answered`), grey `#edebe9` = not met (`--summit-color-status-unanswered`). Excel can't read CSS variables, so these are fixed hex copies, noted in DESIGN.md. |
| 4 | Award details (tooltips) | **Left out.** |
| 5 | Above the table | **Same as the printout plus the section logo:** title, `{group} · {unit}`, filters in effect, generated date. |
| 6 | Names | **One Member column** following the screen's name-format setting. |
| 7 | Progress | **"X of Y" text column, plus a separate % column** (a real number, formatted as %) so it sorts. |
| 8 | Extra columns | **None.** |
| 9 | Rows | **What's on screen:** current filters and order, same rule as the printout. |
| 10 | Excel features | **Freeze header rows + Member column.** No filter dropdowns, no in-file print setup. |
| 11 | Button | **Separate "Excel Export" pill** beside Print / PDF. |
| 12 | File name | `Summit - OAS Progression - Summary - {Unit} - {yyyymmdd}.xlsx`. Characters Windows forbids in file names (`\ / : * ? " < > \|`) in the unit name become `-`. |
| 13 | Apps to verify in | **Excel desktop, Excel online, Google Sheets.** |

### Confirmed after Stage 1 (user, 2026-10-12)
- **% column** straight after Progress, headed "%".
- **Excel's default font**, not Nunito Sans.
- **Member names in normal weight**, as on screen.
- **OAS Table tab:** large exports probably won't be offered, and the tab isn't finalised. Left out for now.
- **Order of later stages:** still to decide.

## Technical approach (agreed by default; object if you disagree)

- **Built from data, not the screen DOM.** The export reads the same row objects the Summary table renders (`PeakAwardMemberRow` → `buildRowView`), so numbers stay numbers. Print clones the DOM because it wants the look; a spreadsheet wants values.
- **New shared module `src/excel/`**, mirroring `src/print/`, with one profile per table.
  - It reuses the print side's title and filter-meta builders (`buildSummaryPrintMeta`, `TerrainState.getUnitName/getGroupName`, section logo lookup), so the header wording matches the printout exactly.
- **Download** via a Blob link in the page. `xlsx` already downloads this way from Terrain's page today.
- `xlsx` stays installed until every caller has moved (later stage).

## Risks to check in Stage 0 (not assumed)

1. **Logo image in the browser build.** write-excel-file's image examples use Node streams. The browser build must accept image bytes from the extension's own `images/sections/*` URL. If it can't, the fallback is to show no logo; you'd be asked first.
2. **Bundle size** added to the extension: measured, reported.
3. **The three apps** render the fills, merges, freeze panes and logo correctly. Google Sheets is the most likely to differ.
4. The package's ES module output builds through Summit's webpack/babel setup, and Jest can run it.

## Stages

**Stage 0: Library spike (no visible UI change).**
- Add write-excel-file.
- Generate a sample Summary-shaped workbook (scrubbed fake names) from a Jest test, writing the .xlsx into the scratchpad for you to open.
- Check risk items 1–4.
- Go / no-go before Stage 1.

**Stage 1: Summary tab export.**
- `src/excel/` module, the Summary profile and the Excel Export button, per the decisions above.
- Jest specs for cell values, colours, merges, freeze, header text and file name.
- `npm test`, `npm run lint`, `npm run build`, then a live check in Edge and your three apps.

**Later (order to be agreed):**
- Heatmap tab.
- OAS Table tab and Present Awards: replace the plain dumps.
- React DataGrid pages: move them over, or leave them on `xlsx` until those pages are rebuilt.
- Remove `xlsx` (clears the audit warning).
