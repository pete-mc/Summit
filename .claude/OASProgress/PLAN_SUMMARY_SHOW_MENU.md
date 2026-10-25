# OAS Progress > Summary tab: "Show" dropdown

Request (chat 2026-10-25): add a Show dropdown to the Summary tab with
- Skills > Not Started (Overall table)
- Grouping > Break by patrol (both tables)

and make print and Excel match.

## Decisions (agreed)

| Topic | Decision |
| --- | --- |
| Control | A multi-select "Show" `v-select`, the same pattern as the Heatmap and Worksheets tabs (subheaders, "N selected"). Placed after Name format, before Reset filters. |
| Not Started | Default **on** (today's behaviour). Off hides every Overall column where **all listed members** show `-`. So filtering to a patrol or a member trims columns to what they have started. Same label and meaning as the Heatmap's Skills > Not Started. |
| No members listed | Columns are kept (no rows means nothing to judge by). |
| Break by patrol | Default **off**. A grey patrol-title row above each patrol's members, as on the Heatmap (`oas-heatmap-patrol-title-row`). Patrols A–Z, Unassigned last. Sort by / column sort apply within each patrol. |
| Patrol option shown | Only when the unit has patrols (`availablePatrols.length > 0`), like the other tabs. |
| Saved state | New keys `summaryShowNotStartedSkills` (true) and `summaryBreakByPatrol` (false). Both reset by the Summary tab's Reset filters. |
| Print | Both parts get the patrol-title rows (styled like the Heatmap printout). Hidden columns don't print. Filters line adds `Hidden: Skills not started` when unticked (same wording as the Heatmap). Break by patrol is visible in the printout, so not in the filters line. |
| Excel | Both sheets get a bold, muted patrol-title row spanning the table. The Overall sheet leaves out hidden columns. |

## Design

- `filterHeatMapSections.ts`: `groupRowsByPatrol(rows, breakByPatrol)` → `PatrolGroupOf<T>[]`. Off = one unlabelled group. Used by both tables and both Excel sheets, so the screen and the exports can't drift.
- `buildOverallProgressRows.ts`: rows carry `patrolName`; new `hideNotStartedColumns(columns, rows)` returns the trimmed columns and rows.
- `OasProgressVueContent`: `overallProgressView` computed (columns + rows after the toggle). Passes `breakByPatrol` to both tables and to both sheet builders.
- `OASPeakAwardSummaryFiltersVue`: Show select (needs `availablePatrols`).
- Tables: iterate groups, title row `colspan` = column count.
- `summitExcel.ts`: share the Heatmap sheet's `titleRow` as `excelTitleRow`.
- Print profiles: shared patrol-title CSS from `heatmapShared.ts`; the Overall profile's centred `td` rule must not centre the title cell.
- `oasPrintMeta.buildSummaryPrintMeta`: Hidden line.

## Tests

- `hideNotStartedColumns`, `groupRowsByPatrol`.
- Both sheet builders: title rows present only when breaking by patrol, spanning every column.
- `buildSummaryPrintMeta`: Hidden line.
- Content: Summary Reset filters resets the two new keys.

## Verification

`npm test`, `npm run lint`, `npm run build`, then live in Edge: toggle each option, check both tables, print preview and the Excel file.
