# Plan: Datagrid Filter Labels and Horizontal Scroll

Update the shared datagrid component so per-column filter text no longer includes the word "Filter", uses Initial Caps with spaces (including hyphen/underscore/camelCase normalization), and supports horizontal scrolling when table content exceeds viewport width. The work is split into small TDD-first phases to minimize regressions across all report pages.

## Phases 4

1. **Phase 1: Humanize column filter textbox text**
    - **Objective:** Replace raw column-id filter text with user-friendly Initial Caps labels and remove the "Filter" prefix.
    - **Files/Functions to Modify/Create:** `src/components/DataGrid.tsx` (column filter placeholder generation helper), `tests/unit/components/data-grid-column-filtering.spec.ts`.
    - **Tests to Write:** `renders_column_filter_placeholders_without_filter_prefix`, `formats_hyphenated_and_underscored_column_ids_as_initial_caps`, `formats_camel_case_column_ids_as_initial_caps`.
    - **Steps:**
        1. Add failing tests for placeholder format and naming.
        2. Implement minimal formatting helper and wire to column filter inputs.
        3. Run focused datagrid filtering tests to verify pass.

2. **Phase 2: Keep filtering behavior contract stable**
    - **Objective:** Ensure UI label text changes do not alter filtering keys, attributes, or filtering results.
    - **Files/Functions to Modify/Create:** `src/components/DataGrid.tsx`, `tests/unit/components/data-grid-column-filtering.spec.ts`.
    - **Tests to Write:** `retains_data_grid_column_filter_attribute_by_raw_column_id`, `column_filtering_still_applies_using_column_id_keys`.
    - **Steps:**
        1. Add tests asserting raw ID binding remains unchanged.
        2. Confirm filtering updates and matching still use column id keys.
        3. Run datagrid filtering contract tests.

3. **Phase 3: Add horizontal scroll for table area**
    - **Objective:** Make datagrid table horizontally scrollable when columns overflow viewport width.
    - **Files/Functions to Modify/Create:** `src/components/DataGrid.tsx` (table wrapper container), `src/styles/index.css` (overflow-x and table width behavior), tests for structure/class.
    - **Tests to Write:** `renders_table_inside_horizontal_scroll_container`, `applies_scroll_container_class_for_overflow`.
    - **Steps:**
        1. Add failing structural tests for scroll wrapper.
        2. Implement wrapper and CSS overflow rules.
        3. Run datagrid tests to confirm no regressions.

4. **Phase 4: Consistency polish and verification**
    - **Objective:** Apply approved wording consistency to global filter text and run final build/test verification.
    - **Files/Functions to Modify/Create:** `src/components/DataGrid.tsx`, relevant unit tests.
    - **Tests to Write:** `uses_search_rows_global_placeholder`.
    - **Steps:**
        1. Add/update failing test for global placeholder text consistency.
        2. Implement wording update (`Filter rows...` -> `Search rows...`).
        3. Run datagrid unit tests and project build.

## Open Questions 0

- User-confirmed decisions:
  - Per-column labels should be humanized and not include "Filter": ✅
  - Global placeholder should remove "Filter" for consistency: ✅
    - Horizontal scroll should apply to table area when needed: ✅
