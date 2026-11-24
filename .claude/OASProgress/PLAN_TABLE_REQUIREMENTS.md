# OAS Progress: Next Steps (was Table) and Stage Grid (was Worksheets)

Agreed in chat 2026-11-20. First, simplified step towards a printable sheet like Terrain's stage guidance PDFs
(e.g. `https://templates.terrain.scouts.com.au/oas/vertical/3/oas-vertical-3-requirement.pdf`: one skill + stage,
grouped Plan> / Do> / Review>, columns Statement, Guidance, Comments, Verifier name & date).

## Decisions

| Topic | Decision |
| --- | --- |
| Awarded | Never shown. Awarded rows are dropped before any option list or row is built, so a stage the member has been awarded is not offered at all. |
| Filters | Filter bar above the table, like the other tabs: Member, Skill, Stage, each a single choice, plus Reset filters. No in-table filter row, no Clear filters button. |
| Member | Type-to-search dropdown, from the page's member list (`unitMembers`), sorted by first name. Never empty: falls back to the first member. |
| Skill | Only Skill - Streams where the chosen member has an un-awarded stage, in OAS order (trunk before streams). Kept when the member changes, if still offered. |
| Stage | Only the chosen member's un-awarded stages of that skill. Defaults to the lowest (the stage they're working on). Changing member or skill goes back to the lowest. |
| Columns | Group, Answered, I-Statement, Date. Answered is the heat map's green/grey square; Date is DD/MM/YYYY. |
| Width | The table is only as wide as its content (`width: fit-content; max-width: 100%`). I-Statements stay on one line while there is room and wrap once the window is narrower (min 200px, then the box scrolls). |
| Look | Same block as Summary / Peak Award: `.oas-heatmap-scroll` + `oas-heatmap-data-table`, no paging, no footer. The "debug tool" notice goes. |
| Nothing left | A member with every stage awarded gets "Every stage has been awarded." instead of a table. |
| Saved state | New keys `tableMemberId`, `tableSkillStream` (skillStreamKey), `tableStage` (null = lowest). Reset filters clears them. |
| Print / Excel | Not reworked yet. They keep working on the shown rows; print meta becomes Member, Skill, Stage. The Excel sheet still has its old 8 columns. |

## Code

- `services/oasTableRows.ts`: `OASTableRow` (moved from the component), `listOutstandingRows(items, memberId)`,
  `listStageOptions(rows, skillStreamKey)`, `buildTableRows(rows, skillStreamKey, stage)`.
- `components/OASTableFiltersVue.ts/.vue`: props `memberId`, `memberOptions`, `skillStream`, `skillStreamOptions`,
  `stage`, `stageOptions`; emits `update:*` and `reset`.
- `components/OASProgressTableVue.ts/.vue`: just `rows`, rendered like the summary tables; `getPrintTable()` stays.
- `OasProgressVueContent`: resolve member → outstanding rows → skill → stage → rows. Drop `tableColumnFilters`,
  `tableMemberId` data, `prepareTablePrint`.
- `oasPrintMeta.buildOasTablePrintMeta(memberName, skillLabel, stage)`.

## I-Statements cleanup (2026-11-23)

- Tab, print title and Excel sheet renamed "I-Statements" (internal `viewMode: "table"` kept, so saved state still works).
- Column lines like the other tables; Plan / Do / Review merged into one Group cell (rowspan), as on the Worksheet.
- Body cells vertically centred, on screen and in print. Now a rule in `.claude/DESIGN.md`.

## Worksheet: a many-member version of I-Statements (2026-11-23)

| Topic | Decision |
| --- | --- |
| Layouts | Keep both, and every existing filter. Members as columns is the default (also on Reset). |
| Sort by | First name / Last name (`worksheetSortBy`), both layouts; with break by patrol, sorted within each patrol. |
| Member headers | Body size (14px) so names are easy to read, normal weight, bottom-aligned like other headers. |
| Skill | One choice (as before), only Skill - Streams present in the data. |
| Stage | One choice, `worksheetStage` (replaces `worksheetVisibleStages`). Options are the stages that Skill - Stream has (Vertical 1-3, Vertical - Abseiling 4+). A new skill keeps the stage on screen if it has it, otherwise its lowest. |
| Cells | Heat map box: green awarded, yellow answered, grey not answered. Date on hover only. n/a unchanged. Cell background no longer green. |
| Awarded | Kept, still behind Show → Awarded. |
| Print / Excel / page splitting | See "Print, Excel and splitting" below. |

## Print, Excel and splitting (2026-11-23)

| Topic | Decision |
| --- | --- |
| Member columns | 30px on screen (`MEMBER_COLUMN_MIN_WIDTH_PX`, was 70px for dates), 6mm in print, 4 characters in Excel. |
| Splitting | `runBatchRanges`: with break by patrol, a patrol stays on one sheet unless it alone is wider than a sheet; members as rows keeps Plan / Do / Review together. Fewest sheets, then evened out (10 + 12, not 20 + 2). Every batch uses the widest batch's widths. |
| Worksheet print | Status boxes in the screen's colours (`copyComputed`), 3.2mm. Old date, tick-box and green-cell CSS removed. n/a unchanged. |
| Worksheet Excel | Coloured box cells (green / yellow / grey, white border as the gap), no dates. n/a unchanged. |
| I-Statements print | A4 portrait (like Terrain's stage sheets). Answered box in screen colour, centred; Group bold. |
| I-Statements Excel | Same 4 columns as the screen: Group merged over its rows, Answered box, I-Statement, Date. Member / Skill / Stage are in the header block. |

## Next (not this change)

- Print/PDF modelled on the Terrain sheet: group headings, Guidance (template `dialog_text`), blank comment and
  verifier columns.

## Renamed (2026-11-24)

- Tabs: "I-Statements" (was Table) → **Next Steps**; "Worksheets" → **Stage Grid**. Chosen for what each is for: one member's
  outstanding I-Statements vs. many members against one stage.
- Renamed through the code too: components `OASNextStepsVue`, `OASNextStepsFiltersVue`, `OASStageGridVue`,
  `OASStageGridFiltersVue`; services `nextStepsRows`, `buildStageGridPages`, `stageGridPrintPageSize`; Excel sheets and print
  profiles `oasNextSteps` / `oasStageGrid` (`oas-next-steps`, `oas-stage-grid`); CSS `oas-stage-grid-*`, `oas-next-steps-*`;
  state keys `nextSteps*` / `stageGrid*`, viewMode `nextSteps` / `stageGrid`.
- Saved filters carry over: `migrateRenamedTabs` maps the old `table*` / `worksheet*` keys and viewModes on load.
- Not carried over: saved print-dialog choices for the two profiles (keyed by profile name), and the dev aid's localStorage key
  is now `summit.oasProgressVue.devDuplicateMembers`.
