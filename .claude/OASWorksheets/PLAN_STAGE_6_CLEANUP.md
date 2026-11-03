# Stage 6: Worksheets cleanup: borders, column widths, one Skill - Stream, standard print and Excel

Asked for on 2026-11-03.

## Requests
1. The table borders and formatting should match the Summary and Heatmap tabs.
2. Narrow worksheets shouldn't be stretched across the page. Columns stay at a maximum width as long as their text fits, especially in "Members as columns".
3. The Skill dropdown lists "Skill - Stream" combinations, and only one can be picked (radio-button style).
4. Print and export are set up the same way as on the other tabs.

## Decisions (Q&A, 2026-11-03)
| Topic | Decision |
|---|---|
| Print | Use the standard `SummitPrintButton` (page-setup dialog, logo/unit/filters header, "Page X of Y"). Each worksheet sheet is its own print part, so it starts on a new page with the header. A sheet that's too wide shrinks a little, then splits, repeating the leading columns. `printWorksheets.ts` and the hand-made print splitting are removed. |
| Worksheets Excel | New. One tab per worksheet sheet ("Stage 2", …), in the on-screen layout, with dates in the cells and the same header as the printout. |
| Table Excel | Moved from the old `exportGridToExcel` to `summitExcel` (header, logo, standard file name). |

## A. Screen
- **Borders.** Wrap each worksheet `<table>` in Vuetify's data-table markup (`v-simple-table dense`), the same look as the Heatmap and Summary `v-data-table`s:
  - outer `light-charcoal` border with a 4px radius on the wrapper;
  - Vuetify's thin row separators;
  - 1px `border-subtle` lines between columns;
  - 1px `border-default` after the fixed columns and at group/patrol boundaries, replacing the current 2px lines.
  - Keep the sticky header and sticky first columns. The wrapper's overflow is made visible so they still stick to the page.
  - Turn off Vuetify's row hover: it would grey only the non-sticky cells.
- **Widths.**
  - **Members as columns:** member columns are a fixed 70px (the width a date or tick box needs) and the I-statement column a fixed 420px, not spread across the screen. Screen batching (`maxFittingMemberColumns`) stays, so huge units still split.
  - **Members as rows:** widths are already fixed on screen; print is fixed in B.
- **Skill - Stream, single choice.**
  - A new filter key, `worksheetSkillStream: string`, replaces `worksheetVisibleSkills: string[]`. Its value is `"<skill>::<stream>"`, with stream = skill on the trunk. It defaults to `"camping::camping"`.
  - The options come from the loaded rows, ordered like the Table tab's Skill filter (OAS skill order, trunk first, then stream name). The label/ordering helper moves to a shared service.
  - A stored value that isn't in the list falls back to the first option, the same pattern as the Table member picker. The old `worksheetVisibleSkills` key is ignored.
  - `buildWorksheetPages` takes `skillStream` in place of `visibleSkills`, and page titles stay as they are. The Stages multi-select is unchanged.

## B. Print
- New print profile `oas-worksheets`, titled "OAS Progress - Worksheets", A4 landscape, `fit`. Each live worksheet table is printed as one part, under the settings key `oas-worksheets`.
- The profile CSS covers rotated headers, the 7mm tick boxes, awarded/n-a colours (copied from computed styles), sticky cells reset, `width: auto` (so the table is not stretched to full width), the I-statement column width, and the group band rotated as before.
- `repeatColumns`: 2 for members-as-columns (group band + statement), 1 for members-as-rows (member name). The value is picked per part.
- Header meta: Skill, Stages, Patrols (when filtered), Hide awarded. Built in `oasPrintMeta.ts`.
- Remove `printWorksheets.ts`, `splitTableColumnsForPrint`, `splitRowsTableColumnsForPrint` and the print-only constants that become unused.

## C. Excel
- `src/excel/sheets/oasWorksheets.ts`: one sheet per unsplit `WorksheetPage` (Excel has no page width). Members as columns or rows follows the layout filter.
  - Header rotation follows the screen.
  - Dates are real Excel dates.
  - Awarded cells use the awarded fill, and n/a cells show grey "n/a".
  - Patrol breaks show as title rows (members as rows) or a header row (members as columns).
- `src/excel/sheets/oasTable.ts`: the Table columns. Answered/Awarded are Yes/No and Date is an Excel date.
- File names: "Summit - OAS Progress - Worksheets - …" and "… - Table - …".

## Verification
- `npm test` (only the known UNC smoke-test failure), lint on the changed files, `npm run build`.
- Edge:
  - Worksheets borders look like the Heatmap.
  - A 3-member unit isn't stretched, in both layouts, on screen and in print.
  - The Skill list shows combos, one at a time.
  - Print dialog, header and footers work, and each sheet starts a new page.
  - A wide sheet splits with its leading columns repeated.
  - Both Excel exports open correctly.
