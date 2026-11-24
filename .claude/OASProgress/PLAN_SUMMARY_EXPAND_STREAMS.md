# OAS Progress – Summary: "Expand Streams" option

Agreed with the user 2026-11-24.

## Requirement

Summary tab → Filter row → **Show** dropdown gets a new item **"Expand Streams"** under the existing "Skills" header (above "Not Started").

- **Ticked (default)** = today's table: one column per skill trunk and one per stream.
- **Unticked (collapsed)**:
  - Stream columns are hidden. Each skill has one column, headed by the skill name only (e.g. "Bushcraft"). Pioneering and Survival collapse into Bushcraft. Separate skills (Bushwalking, Camping…) never merge.
  - The cell shows the **highest awarded stage** across the skill's trunk and all its streams, as a whole number only (`5`, never `5.2`). Nothing awarded → `-`.
  - The cell tooltip lists one line per trunk/stream that has an award, showing that part's highest award, in the Peak Award Core Skills format (`awardTooltip`):
    ```
    Bushcraft - Stage 3 - 02/02/2025 as a Scout
    Pioneering - Stage 5 - 12/03/2026 as a Scout
    Survival - Stage 4 - 20/01/2026 as a Scout
    ```
- Column width stays as it is now (no narrowing).
- Clicking a collapsed header sorts by that column, as before. A saved sort on a stream column (e.g. `bushcraft::pioneering`) is shown as a sort on its skill while collapsed. The saved value is not changed, so re-expanding restores the stream sort.
- "Not Started" off still hides columns no listed member has started (works on collapsed columns too).
- Print and Excel follow the on-screen table. When collapsed, print/Excel meta gets `Streams: Collapsed`.
- Persisted like the other Summary filters (`summaryExpandStreams`, default `true`), and reset by the Summary tab's "Reset filters".
- Peak Award tab (same filter component) does not get the option.

## Design

### Data (`src/pages/OasProgress/services/`)
- `groupRowsForHeatMap.ts`: `HeatMapCell` gains `section: string | null` (copied from `OASProgressRow.section`), so a stage's award date and section are available.
- `buildOverallProgressRows.ts`:
  - `OverallProgressRow.cells` becomes `OverallProgressCell[]` = `StageProgressDisplay & { title: string | null }`. Expanded cells have `title: null`.
  - `buildCollapsedOverallProgressColumns(grouped)`: one column per skill, `key = skill + "::"` (same key as the trunk column, so a trunk sort carries over unchanged), `stream: null`.
  - `buildCollapsedOverallProgressRows(grouped, members)`: for each skill, max `highestStage` over its sections; title lines from each section's highest complete stage (`cells[0].date/section`, branch = section.stream ?? skill).
  - `collapsedColumnSort(sort)`: maps `skill::stream` → `skill::`.
- `awardTooltip` currently lives in `OASPeakAwardSummaryVue.ts`; the service builds a `StageAward`-shaped object and calls it (import is fine: services in OasProgressVue already import from components there, e.g. `oasPrintMeta`). If that creates an awkward dependency from `OasProgress/services` → `OasProgressVue/components`, move `awardTooltip` + `formatAwardDate` to `OasProgressVue/services/` instead, and have Peak Award import them from there.

### UI
- `OASSummaryTabFiltersVue.ts/.vue`: new prop `expandStreams: Boolean | null` (null = not offered, so Peak Award omits it); `ShowOption` adds `"expandStreams"`, text "Expand Streams", first under the Skills header.
- `OasProgressVueContent`: `summaryExpandStreams: true` in defaults + `SUMMARY_FILTER_KEYS`; `overallProgressColumns/Rows` choose expanded vs collapsed builders; pass effective column sort to the table and the row sort; `.sync` the new prop.
- `OASOverallProgressVue.vue`: `:title="cell.title"` on each cell `<td>`.
- `oasPrintMeta.buildSummaryPrintMeta`: push `{ label: "Streams", value: "Collapsed" }` when `summaryExpandStreams === false`.
- `OASProgressVueFilterPersistence.ts`: add the field to `OASProgressVueFilterState`. Old saved state without it falls back to the default via the defaults spread.

### Tests
- `buildOverallProgressRows.spec.ts`: collapsed columns (one per skill, trunk key), max across trunk/streams, whole number only, `-` when nothing awarded, tooltip lines per section, separate skills don't merge, `collapsedColumnSort`.
- `OASSummaryTabFiltersVue.spec.ts`: item shown when prop non-null, hidden when null; toggling emits `update:expandStreams`.
- `OASOverallProgressVue.spec.ts`: cell title rendered.
- `OasProgressVueContent.spec.ts` / print meta: default true, reset, `Streams: Collapsed` meta.

## Verify
`npm run build`, `npm test`, then reload unpacked extension in Edge and check Summary with a real unit: toggle, tooltip, sort carry-over, Not Started interaction, Print, Excel.
