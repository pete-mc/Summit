# OAS Progress › Table: one member at a time, combined Skill column

## Context
The Table tab lists every I-statement for every member across all 9 skills, so it can run to thousands of rows. That makes print and Excel export impractical. Two changes cut the size down:
1. The **Member** column filter becomes a single-select dropdown, like Stage. Exactly one member is always selected (no "none"), and it defaults to the first member.
2. **Skill** and **Stream** merge into one column, `Skill - Stream` (e.g. "Camping - Lightweight"), or just `Skill` for trunk stages.

These are Table-only changes. `OASProgressRow` and the Summary, Heatmap and Worksheets tabs don't change: the combined label is added only to the table's own rows.

Decisions made with the user:
- Picking "Camping" in the Skill dropdown shows **only the trunk rows**. Every dropdown entry is an exact match.
- The Member picker is a **type-to-search** `v-autocomplete`, styled like the other filter boxes.
- The member choice is not persisted, matching the other Table column filters (`tableColumnFilters` lives in `data()`).

## Changes

### 1. `src/pages/OasProgressVue/components/OASProgressTableVue.ts`
- Add `export type OASTableRow = OASProgressRow & { skillStream: string }`.
- Add `export function skillStreamLabel(row)`. It returns `skillTitle(row.stream)` when `row.branch === row.stream` (the trunk), otherwise `` `${skillTitle(row.stream)} - ${formatStream(row.branch)}` ``. Reuse `skillTitle`/`formatStream` from `OASHeatMapVue.ts`; `buildWorksheetPages.ts:114` already uses the same `stream === skill` trunk test.
- Add `export function listTableMembers(items): Array<{ text: string; value: string }>`. It returns distinct members by `memberId`, with `text: memberName`, sorted by `firstName` then `lastName` (same comparator as `sortMembers` in `filterHeatMapSections.ts:186`, never re-splitting `memberName`, per NAME_RESOLUTION).
- Add `export function buildTableRows(items, memberId): OASTableRow[]`. It filters to the member first, then adds `skillStream`, so the label is only computed for the rows shown.
- `HEADERS`: replace the Skill and Stream entries with `{ text: "Skill", value: "skillStream", filterType: "select" }`. Mark Member as `filterType: "member"`; the template renders it separately, and it is not a `columnFilters` key.
- `filterOASProgressRows` → takes `OASTableRow[]`. Select-type columns use an **exact** match and text columns keep the substring match. Look up the header's `filterType` from `HEADERS` by field. Today's select values (stage, yes/no, group) are already exact strings, so their behaviour doesn't change.
- New prop `memberId: String` (required). New computed `memberOptions` = `listTableMembers(this.items)`. `filteredItems` = `filterOASProgressRows(buildTableRows(this.items, this.memberId), this.columnFilters)`.
- `columnFilterOptions`: drop `stream`/`branch` and add `skillStream`. Its options are the distinct labels from **all** items (so the list doesn't change between members), ordered by `OAS_SKILLS` index, then trunk first, then stream name.
- `onMemberChange(id)` emits `update:memberId` and ignores null/empty, so the selection can never become "none". `onClearFiltersClick` leaves the member as it is.

### 2. `OASProgressTableVue.vue`
- In the `#body.prepend` filter row, add a `v-if="header.filterType === 'member'"` branch: a `<v-autocomplete>` bound to `memberId` and `memberOptions`, with `solo flat dense hide-details` and the `oas-vue-column-filter-input` class, **no `clearable`**, `@change="onMemberChange"`. It sits before the existing `select` / text-field branches.
- Add `v-autocomplete`'s typed `input` to the existing font-size override selector, if it isn't already covered by `.v-text-field ::v-deep input` (v-autocomplete extends v-text-field, so it should be).

### 3. `src/pages/OasProgressVue/components/OasProgressVueContent.ts` / `.vue`
- `data`: add `tableMemberId: ""`.
- Computed `tableMemberOptions` = `listTableMembers(this.items)`. Computed `resolvedTableMemberId` = `tableMemberId` if it's in the options, else the first option's value. This covers first load, streams arriving one at a time, and a member who has left.
- `tableFilteredItems` = `filterOASProgressRows(buildTableRows(this.items, this.resolvedTableMemberId), this.tableColumnFilters)`.
- Template: `<OASProgressTableVue ... :member-id="resolvedTableMemberId" @update:memberId="tableMemberId = $event" />`.
- `TABLE_EXPORT_COLUMNS`: replace the `stream`/`branch` columns with `{ key: "skillStream", header: "Skill" }`. The rows are now `OASTableRow`, which already holds the label.
- `tablePrintMeta` passes the selected member's name, taken from `tableMemberOptions`.

### 4. `src/pages/OasProgressVue/services/oasPrintMeta.ts`
- `buildOasTablePrintMeta(columnFilters, memberName)` puts `{ label: "Member", value: memberName }` first, then the existing per-header loop. The loop skips the `member` filterType header.

### 5. Tests
- `tests/unit/components/oas-progress-table-vue-render-contract.spec.ts`: update the header list and the select/text column split, and change the `makeRow` fixtures to include `firstName`/`lastName`. Replace the `memberName` substring cases with member-id cases, and add exact-match cases for select columns. New tests cover `skillStreamLabel` (trunk vs stream), `listTableMembers` (dedupe and first/last sort), the `skillStream` option ordering, and the template's non-clearable `v-autocomplete` for Member.
- `tests/unit/print/oasTablePrint.spec.ts`: new `buildOasTablePrintMeta` signature, with Member first.
- `tests/unit/components/oas-progress-vue-render-contract.spec.ts`: update any `TABLE_EXPORT_COLUMNS` or `tableFilteredItems` assertions, and add a test for `resolvedTableMemberId` falling back to the first member.

### Housekeeping
- On implementation, copy this plan to `.claude/OASTable/PLAN.md` (the per-feature plan folder).
- Comments: only gotchas (e.g. why Member isn't part of `columnFilters` or Clear filters). Run the pre-commit comment check from CLAUDE.md.

## Verification
1. `npm test`: everything passes apart from the known UNC-path lint smoke test.
2. `npm run lint` on the changed files.
3. `npm run build`, reload the unpacked extension in Edge, then on Terrain go to OAS Progress › Table:
   - The first member (by first name) is selected on load, with no clear "x". Typing part of a name filters the list. Rows are that member's only.
   - The Skill column shows "Camping" for trunk rows and "Camping - <Stream>" for stream rows. Picking "Camping" shows trunk rows only.
   - "Clear filters" clears the other columns but keeps the member.
   - Print shows "Member: <name>" in the header meta, with that member's rows only. Excel export has a single Skill column and only that member's rows.
   - The Summary, Heatmap and Worksheets tabs look unchanged.
