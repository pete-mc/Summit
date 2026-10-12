# Stage 1: Summary tab Excel export

Parent plan: [PLAN.md](PLAN.md). Started 2026-10-12, after the user approved the Stage 0 sample: looks right in all three apps, titles stay frozen, and box width is fine.

## Status: done. Confirmed live by the user 2026-10-12: the file downloads in Edge and works in Excel desktop, Excel online and Google Sheets, with the logo in all three.

`npm test` passes except the known UNC smoke test. Lint is clean on the changed files, and the build succeeds.

## What was built

- **`src/excel/summitExcel.ts`** (shared):
  - `EXCEL_COLOURS` (hex copies of the status tokens);
  - `buildExcelFileName`;
  - `resolveExcelHeader`, which takes its wording from the summit-print profile;
  - `buildHeaderBlock`;
  - `loadSectionLogoImage` (fetch + `createImageBitmap` for the real size; returns null on any failure, so the export still works without a logo);
  - `downloadWorkbook` / `workbookToBlob`.
- **`src/excel/sheets/peakAwardSummary.ts`:** builds the Summary sheet from `filteredPeakAwardSummaryRows`, the same rows and order as the screen.
  - Box counts come from the section's `PeakAwardRequirement`.
  - % is the screen's truncated whole percent, stored as a number formatted `0%`.
- **`OasProgressionVueContent`:** an "Excel Export" pill beside Print / PDF on the Summary tab.
  - Shown only when the section is known, since there's no table otherwise.
  - Shows a spinner while exporting; reports success or failure in the existing feedback line.
- **`summitPrint.ts`:** `resolveHeaderFooter` takes `HeaderFooterOptions` (the print options without `source`), so it can be used without a table. No behaviour change.
- **Removed:** the Stage 0 spike test.
- **Tests:**
  - `tests/unit/excel/summitExcel.spec.ts` and `peakAwardSummarySheet.spec.ts`, including unzipping a real workbook to check merges and frozen panes;
  - a render-contract test for the button.
- **DESIGN.md:** new "Excel export: use summit-excel" section, including the colour-copy rule.

## Choices made in building (all confirmed by the user, 2026-10-12)

- Excel's default font is used (not Nunito Sans). Nunito isn't installed on most PCs, and Excel would substitute it anyway.
- Member names are plain weight, as on screen. The printout makes them semibold.
- The `%` column sits right after Progress, headed "%" (proposed in PLAN.md; not yet confirmed).

## Live check (user)

1. Hard-refresh onto OAS Progression → Summary. Click **Excel Export**. The file should download as `Summit - OAS Progression - Summary - {your unit} - {today}.xlsx`.
2. **Logo present?** This is the one thing the tests can't prove: fetching the logo from the extension inside Terrain's page. If it's missing, DevTools shows a `[summitExcel] Section logo left out…` warning; send me that line.
3. The rows match the screen, including after changing the Member/Patrol filters and the sort. The meta line lists the filters.
4. Open the file in Excel desktop, Excel online and Google Sheets.

## Known limit for later stages

The zip library compresses files over 160 KB in a background worker created from a `blob:` URL. Terrain's page security policy might block that. Summary sheets are far below it.

The user probably won't allow exporting large tables like the OAS Table tab (2026-10-12), and that tab isn't finalised yet. So this risk only matters if a large export is ever added.
