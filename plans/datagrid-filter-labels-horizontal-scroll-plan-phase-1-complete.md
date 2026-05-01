# Phase 1 Complete: Humanize column filter textbox text

Per-column filter textbox placeholders are now user-friendly labels without the "Filter" prefix. Column IDs are normalized to Initial Caps with spaces across hyphenated, underscored, and camelCase forms while preserving filtering behavior contracts.

**Files created/changed:**

- `src/components/DataGrid.tsx`
- `tests/unit/components/data-grid-column-filtering.spec.ts`

**Functions created/changed:**

- `toColumnPlaceholder` (added in `src/components/DataGrid.tsx`)
- DataGrid column filter placeholder rendering logic (updated)

**Tests created/changed:**

- Added coverage in `tests/unit/components/data-grid-column-filtering.spec.ts` for:
  - hyphenated ID formatting (`crew-role` -> `Crew Role`)
  - underscored ID formatting (`patrol_name` -> `Patrol Name`)
  - camelCase ID formatting (`teamCodeValue` -> `Team Code Value`)
  - raw ID filter-key contract continuity (`data-grid-column-filter` usage)

**Review Status:** APPROVED

**Git Commit Message:**
feat: humanize datagrid filter labels

- Remove "Filter" prefix from column filter placeholders
- Format column IDs into initial-caps spaced labels
- Preserve raw column ID filtering contract and add tests
