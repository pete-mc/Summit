# OAS Progression > Summary tab: "Overall Progress" section

Source request: `resources/DEV_NOTES.md` (lines 47–59), firmed up in chat 2026-10-21.

## Goal

Split the Summary tab into two sections stacked vertically, each under a simple heading:

1. **Peak Award Progress**: the existing `OASPeakAwardSummaryVue` table, unchanged.
2. **Overall Progress**: a new members × skills/streams table. It will eventually replace the
   React "OAS Summary" page (`/summit/reports/oas`). That page is a **reference only**: no code, data
   path or component from it is reused. All data comes from the Vue page's existing `items`, the
   same data the heatmap uses.

## Decisions (agreed)

| Topic | Decision |
| --- | --- |
| Columns | One per heatmap section: each skill's trunk **and** every stream (e.g. Aquatics, Aquatics / Swimming, …). |
| Empty columns | **Always shown**: a fixed layout for every unit, even if nobody has started a stream. |
| Column order | Same as the heatmap: core skills (Bushwalking, Bushcraft, Camping) first, then the rest alphabetically. Within a skill, trunk first, then streams alphabetically. |
| Headers | One header row. Each label is rotated 90° (reads bottom-to-top) with **two lines**: line 1 = skill, line 2 = stream. A trunk column shows the skill only. *(Interpretation of "Both Skill Group & stream rotated but use second line for stream". Confirm when reviewing.)* |
| Cell content | Exactly the heatmap's Stage column: `formatStageProgress()` → e.g. `3` with a small `.04` suffix, or `-`. Same `.oas-heatmap-stage-progress` styling. |
| Filters | The Summary tab's existing filters (member search, patrol, sort, name format) apply to both tables. No new filters. |
| Row order | Identical to the Peak Award table: rows follow `filteredPeakAwardSummaryRows`, so "Sort by Progress" means Peak Award progress in both tables. |
| Print / Excel | **Unchanged for now**: they still output the Peak Award table only. A later stage will add Overall Progress. |
| Unstarted streams | A stream shows `-` until the member has any answered/awarded statement in it, as well as the existing "trunk fully awarded" gate. Applied in the shared `formatStageProgress()`, so the heatmap Stage column and its Stage progress sort changed too. |
| Headings | "Peak Award OAS Progress" and "Overall OAS Progress". |
| Column width | All stage columns are the same fixed width: wide enough for a two-line rotated header. |
| Column sorting | Click a header: highest first → lowest first → cleared. `-` always last; ties keep the Sort by order. Sorts the Overall table only. Saved as `summaryColumnSort`. Choosing any Sort by option (even the current one) or Reset filters clears it. |
| No section resolved | Unchanged: the whole tab shows "Could not determine this unit's section." |

## Design

### Data: pure service, unit-testable

New `src/pages/OasProgression/services/buildOverallProgressRows.ts`:

```ts
interface OverallProgressColumn { key: string; skill: string; stream: string | null; skillLabel: string; streamLabel: string | null }
interface OverallProgressCell { stage: string; nextStageProgress: string | null }
interface OverallProgressRow { memberId: string; cells: OverallProgressCell[] } // cells align with columns

buildOverallProgressColumns(grouped): OverallProgressColumn[]
buildOverallProgressRows(grouped, columns, memberIds: string[]): OverallProgressRow[]
```

- `grouped` = the existing `groupRowsForHeatMap(...)` output. `OasProgressionVueContent` already computes it.
- Skill ordering reuses the heatmap's `orderSkills` / `CORE_SKILLS` (move it to a shared service
  rather than duplicating it).
- Each cell calls `formatStageProgress(member.highestStage, member.stages, section.stream !== null, section.trunkStageCount, member.trunkFullyAwarded)`.
- `memberIds` comes from `filteredPeakAwardSummaryRows`, so filtering and sorting are not re-implemented.

### Component: `OASOverallProgressVue.vue` + `.ts`

- Props: `columns`, `rows`, plus the display names (taken from the Peak Award rows with the same `nameFormat`).
- `v-data-table` with a hand-written `<thead>`, the same pattern and scoped table styles as `OASPeakAwardSummaryVue`.
- Rotated header: copy the worksheets technique (`writing-mode: vertical-rl; transform: rotate(180deg)`),
  with the two lines as separate block spans and the columns kept narrow and centred.
- `getExportTable()` included now, ready for the later print stage.

### Page wiring: `OasProgressionVueContent`

- Add an `overallProgressColumns` / `overallProgressRows` computed.
- Template: `<h3 class="oas-summary-section-heading">Peak Award Progress</h3>`, then the existing table,
  then `<h3 …>Overall Progress</h3>` and the new table. The filter bar stays above both.
- The heading style uses the page's type scale (`--oas-vue-font-size-heading`, `--oas-vue-font-family`)
  and Terrain's blue (`--color-scouts-medium-blue`), with a margin above the second heading.

## Tests

- `tests/unit/.../buildOverallProgressRows.spec.ts`: column order (core first, trunk before streams),
  empty streams still produce columns, the cell matches `formatStageProgress` for trunk/stream/gated
  stream (`-`), and row order follows the given memberIds.
- A component test: two headings render, and the column count = sections count + 1.

## Verification

- `npm test`, `npm run lint`, `npm run build`.
- Live check in Edge (per "verify, don't guess"): headings, rotated two-line labels readable, cells
  match the heatmap's Stage column for a few members, and filters/sort change both tables together.

## Later (not in this stage)

- Print both tables in one printout; add an "Overall Progress" Excel sheet.
- Retire the React OAS Summary page once this covers it.
