# OAS Progress: split Summary into Summary and Peak Award tabs

Agreed in chat 2026-11-20. Large units made the two-table Summary tab hard to use: two scroll boxes, one under the
other, and a printout that always held both. Replaces the "always both" decision in `PLAN_SUMMARY_PRINT_EXCEL.md`.

## Decisions (agreed)

| Topic | Decision |
| --- | --- |
| Tabs | Summary \| Peak Award \| Heatmap \| Table \| Worksheets. Summary = the Overall table only; Peak Award = the Towards Peak Award table only. No `<h3>` headings on either. |
| Filters | Separate keys per tab, like every other tab. Nothing shared between Summary and Peak Award. |
| Summary filters | Member, Patrol, Sort by (First Name, Last Name), Name format, Show (Not Started skills, Break by patrol). Column-header sort as now. "Sort by Progress" removed: it meant Peak Award progress. |
| Peak Award filters | Member, Patrol, Sort by (First Name, Last Name, Progress), Name format, Show (Break by patrol). No Not Started option, no column sort. |
| Member list | Built once by the page from the unit members, used by both tabs. Summary no longer derives its rows from the Peak Award rows. |
| Unknown section | Only the Peak Award tab shows "Could not determine this unit's section." Summary works without a section. |
| Print | One table per tab, single-profile `SummitPrintButton` (settings saved per profile). OAS stops using print `parts`; the multi-part feature stays in `src/print/` for other pages. |
| Print/Excel titles | "OAS Progress - Summary" and "OAS Progress - Peak Award". Sheet tabs "Summary" and "Peak Award". Files `… - OAS Progress - Summary - …` and `… - OAS Progress - Peak Award - …`. |
| Print filter line | Each tab lists only its own filters (Hidden: Skills not started on Summary only). |
| Saved state | A saved `viewMode: "summary"` still opens Summary. A saved `summarySortBy: "progress"` falls back to First Name. Peak Award keys start at their defaults. The old `oas-summary` print settings key is no longer read. |
| Phone width | Not a concern: Edge extensions don't run on phones. On a narrow desktop window Vuetify already shows tab scroll arrows. |
| Narrow window | The table block grows to the table's width (`width: max-content; min-width: 100%`), so the white background doesn't stop short of a table wider than the window. |

## State

`OASProgressVueFilterState`:

- `viewMode` gains `"peakAward"` (also in `VALID_VIEW_MODES`).
- Summary keeps `summaryMemberFilter`, `summaryNameFormat`, `summarySelectedPatrols`, `summaryColumnSort`,
  `summaryShowNotStartedSkills`, `summaryBreakByPatrol`; `summarySortBy` narrows to `"firstName" | "lastName"`.
- New: `peakAwardMemberFilter`, `peakAwardNameFormat`, `peakAwardSelectedPatrols` (null until patrols resolve, like the
  others), `peakAwardSortBy` (`firstName | lastName | progress`), `peakAwardBreakByPatrol`.
- `loadInitialFilters` sanitises `summarySortBy`. `RESETTABLE_FILTER_KEYS_BY_VIEW` gets a `peakAward` entry. The
  patrol watcher and `onResetFilters` resolve `peakAwardSelectedPatrols` too.

## Member list

- New `src/pages/OasProgressVue/services/unitMemberList.ts`: `buildUnitMemberList(members: TerrainUnitMember[])` →
  `{ memberId, firstName, lastName, memberName, patrolName }[]`, plus `filterMemberRows(rows, needle, selectedPatrols)`
  (works on anything with `memberName` and `patrolName`, so Peak Award rows use it too) and `sortMembersByName`.
- Content: `unitMembers` computed from the `members` prop. Summary rows = filter + name sort of `unitMembers`, then
  `buildOverallProgressRows`, then column sort. Peak Award rows as now, with the `peakAward*` keys.
- Heatmap, Table and Worksheets keep deriving members from progress rows for now (they list members by
  section/stream). Follow-up, not this change.

## Filters component

Replace `OASPeakAwardSummaryFiltersVue` with one `OASSummaryTabFiltersVue` used by both tabs, bound per value
with `.sync` so each tab passes its own keys:

- Props: `memberFilter`, `selectedPatrols`, `sortBy`, `sortOptions`, `nameFormat`, `breakByPatrol`,
  `showNotStartedSkills` (`null` hides the option), `availablePatrols`, `patrolFilterOptions`, `canFilterByPatrol`.
- Emits `update:<prop>`, `sort-reselected` (keeps the existing gotcha: re-picking the current sort clears the
  column sort on Summary), `reset`.

## Print, Excel, meta

- `oasPrintMeta.ts`: `buildSummaryPrintMeta` keeps Not Started; new `buildPeakAwardPrintMeta` reads `peakAward*` keys.
- Profiles: titles above. `overall-progress` stays landscape, `peak-award-summary` portrait.
- Content: drop `summaryPrintParts`; each tab's toolbar gets its own Excel and Print buttons
  (`onSummaryExcelExportClick` → Overall sheet only, new `onPeakAwardExcelExportClick`).
- Sheets: `SHEET_NAME` "Summary" / "Peak Award".

## Tests

- Update: `OasProgressVueContent.spec.ts` (view modes, reset, patrol resolution, sort sanitising),
  `OASProgressVueFilterPersistence.spec.ts`, `oas-progress-vue-render-contract.spec.ts` (one print button per tab,
  no `parts`), `multiPartPrint.spec.ts` (titles only), sheet specs (tab names, titles), filter component spec.
- New: `unitMemberList.spec.ts`; Summary rows don't depend on section; Peak Award print meta.

## Check in Edge

- Both tabs with 50+ fake members (`summit.oasWorksheetsVue.devDuplicateMembers`), filters independent.
- Print and Excel from each tab.

## Follow-ups (not this change)

- Right-click / ⋮ row actions (e.g. jump from Summary to that member's Peak Award row).
- Share the page-level member list with Heatmap, Table and Worksheets.
