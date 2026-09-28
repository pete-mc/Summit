import Vue from "vue";
import * as fs from "fs";
import * as path from "path";
import OASProgressionTableVueOptions, { filterOASProgressionRows } from "@/pages/OasProgressionVue/components/OASProgressionTableVue";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";

/**
 * OASProgressionTableVue.ts has no .vue import in its own chain, so — unlike OasProgressionVueContent
 * or OASHeatMapVue's containing files — it can be `new Vue(options)`'d directly here (same approach
 * oas-heatmap-vue-render-contract.spec.ts uses for OASHeatMapVue's own options object). The .vue
 * template itself (v-data-table wiring) is checked via source-text assertions, matching this
 * project's established Jest-can't-import-.vue workaround — see PLAN_VUESTAGE_1.md's "Deviations".
 */

const REPO_ROOT = path.resolve(__dirname, "../../..");

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushwalking",
    branch: "navigation",
    stage: 3,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can pack appropriate gear for an overnight hike",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: true,
    awarded: false,
    date: "2020-11-18",
    ...overrides,
  };
}

describe("OASProgressionTableVue render contract", () => {
  it("declares the items/columnFilters props and default headers state", () => {
    const items = [makeRow()];
    const vm = new Vue({
      ...OASProgressionTableVueOptions,
      propsData: { items },
    }) as unknown as { items: OASProgressionRow[]; columnFilters: Record<string, string>; headers: Array<{ text: string; value: string }> };

    expect(vm.items).toEqual(items);
    expect(vm.columnFilters).toEqual({});
    expect(vm.headers.map((h) => h.value)).toEqual(["memberName", "stream", "branch", "stage", "inputGroup", "iStatement", "answered", "awarded", "date"]);
  });

  it("headers cover the same field set as the React page's flat Table view columns", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.ts"), "utf8");
    ["memberName", "stream", "branch", "stage", "inputGroup", "iStatement", "answered", "awarded", "date"].forEach((field) => {
      expect(source).toContain(`value: "${field}"`);
    });
  });

  it("Skill/Stream/Stage/Group/Answered/Awarded are dropdown filters; Member/I-Statement/Date stay text", () => {
    const vm = new Vue({
      ...OASProgressionTableVueOptions,
      propsData: { items: [] },
    }) as unknown as { headers: Array<{ value: string; filterType?: string }> };

    const selectColumns = vm.headers.filter((h) => h.filterType === "select").map((h) => h.value);
    const textColumns = vm.headers.filter((h) => h.filterType !== "select").map((h) => h.value);

    expect(selectColumns.sort()).toEqual(["answered", "awarded", "branch", "inputGroup", "stage", "stream"].sort());
    expect(textColumns.sort()).toEqual(["date", "iStatement", "memberName"].sort());
  });

  it("columnFilterOptions: Skill options come from OAS_SKILLS, Stage is 1-9, Answered/Awarded are Yes(true)/No(false), Stream/Group are derived from ALL loaded items (not filtered)", () => {
    const items = [makeRow({ inputGroup: "Plan", branch: "navigation" }), makeRow({ inputGroup: "Do", branch: "safety" }), makeRow({ inputGroup: "Plan", branch: "navigation" })];
    const vm = new Vue({
      ...OASProgressionTableVueOptions,
      propsData: { items, columnFilters: { memberName: "nonexistent" } },
    }) as unknown as { columnFilterOptions: Record<string, Array<{ text: string; value: string }>> };

    expect(vm.columnFilterOptions.stream.length).toBeGreaterThan(0);
    expect(vm.columnFilterOptions.stream.map((o) => o.value)).toContain("bushwalking");
    expect(vm.columnFilterOptions.stage.map((o) => o.value)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    expect(vm.columnFilterOptions.answered).toEqual([
      { text: "Yes", value: "true" },
      { text: "No", value: "false" },
    ]);
    expect(vm.columnFilterOptions.awarded).toEqual(vm.columnFilterOptions.answered);
    // Derived from `items` (all loaded rows), NOT `filteredItems` — a memberName filter matching
    // zero rows must not empty out the Stream/Group dropdowns' own option lists.
    expect(vm.columnFilterOptions.branch.map((o) => o.value).sort()).toEqual(["navigation", "safety"]);
    expect(vm.columnFilterOptions.inputGroup.map((o) => o.value).sort()).toEqual(["Do", "Plan"]);
  });

  it("template wires v-data-table to the filtered items, a per-column filter row (body.prepend, lifted to the parent via update:columnFilters), and Yes/No cells for booleans", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain("<v-data-table");
    expect(source).toContain(':items="filteredItems"');
    expect(source).not.toContain(':search="search"');
    expect(source).toContain("#body.prepend");
    // renderedHeaders, not headers: Vuetify removes the grouped column from its own header row,
    // so iterating the raw list emits one <th> too many and shifts every filter box left.
    expect(source).toContain('v-for="header in renderedHeaders"');
    expect(source).toContain(':value="columnFilters[header.value]');
    expect(source).toContain("onColumnFilterInput(header.value");
    expect(source).toContain("#item.answered");
    expect(source).toContain("#item.awarded");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.ts"), "utf8");
    expect(tsSource).toContain('this.$emit("update:columnFilters"');
  });

  it("template renders a v-select for dropdown columns (bound to columnFilterOptions) and a v-text-field with a search icon for text columns", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain("<v-select");
    expect(source).toContain("v-if=\"header.filterType === 'select'\"");
    expect(source).toContain(':items="columnFilterOptions[header.value]"');
    expect(source).toContain('prepend-inner-icon="mdi-magnify"');
  });

  it("filter row inputs use solo/flat (no underline) and no placeholder text (the column header above already labels each box)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain("oas-vue-column-filter-input");
    expect(source).toMatch(/<v-select[^>]*\bsolo\b/);
    expect(source).toMatch(/<v-text-field[^>]*\bsolo\b/);
    expect(source).not.toContain(":placeholder=");
  });

  it("both v-text-field's <input> and v-select's selected-value text override global 20px font-size rules (.v-application .theme--light.v-text-field input, .v-application .v-select__selection--comma), matched to the shared body text size", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toMatch(/\.oas-vue-column-filter-input\.v-text-field ::v-deep input,\s*\.oas-vue-column-filter-input\.v-select ::v-deep \.v-select__selection\s*\{[^}]*font-size:\s*var\(--oas-vue-font-size-body\)\s*!important/);
  });

  it("filter row opts out of v-data-table's own row-hover highlight, and filter boxes get a solid (not translucent) background — fixes the reported bug where boxes were invisible on a white row and only visible once the row's own hover state turned it grey", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toMatch(/\.oas-vue-column-filter-row:hover\s*\{[^}]*background:\s*transparent\s*!important/);
    expect(source).toMatch(/\.oas-vue-column-filter-input ::v-deep \.v-input__slot\s*\{[^}]*background-color:\s*#eceff1\s*!important/);
  });

  it("every rule reaching into a Vuetify-internal descendant element (not one this component's own template writes) uses ::v-deep — Vue 2's scoped CSS only stamps data-v-* onto elements the template itself creates, so a plain descendant selector can never match Vuetify's own internal render output", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    ["v-input__control", "v-input__slot", "v-select__selection", "v-icon"].forEach((internalClass) => {
      expect(source).toMatch(new RegExp(`::v-deep \\.${internalClass}\\b`));
    });
  });

  it("clearable 'x' icon is always visible once a filter has a value, not just on hover/focus (Vuetify's default is unreachable on touch/mobile, which has no hover state)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toMatch(/\.oas-vue-column-filter-input\.v-input--is-dirty ::v-deep \.v-input__icon--clear\s*\{[^}]*opacity:\s*1\s*!important/);
  });

  it("the Clear filters button sits in a fixed-height wrapper so its appearance/disappearance doesn't shift the table up/down", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain('<div class="oas-vue-clear-filters-row">');
    expect(source).toMatch(/\.oas-vue-clear-filters-row\s*\{[^}]*min-height/);
  });

  it("template shows a Clear filters button only when a column filter is active", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain('v-if="hasActiveColumnFilters"');
    expect(source).toContain("onClearFiltersClick");
    expect(source).toContain("Clear filters");
  });

  it("filterOASProgressionRows ANDs every non-empty column filter, case-insensitive substring match, empty/missing filters are no-ops", () => {
    const rows = [makeRow({ memberName: "Alex Scout", iStatement: "I can pack a bag", stream: "bushcraft" }), makeRow({ memberName: "Sam Ranger", iStatement: "I can navigate with a map", stream: "bushwalking" })];

    expect(filterOASProgressionRows(rows)).toEqual(rows);
    expect(filterOASProgressionRows(rows, {})).toEqual(rows);
    expect(filterOASProgressionRows(rows, { memberName: "  " })).toEqual(rows);
    expect(filterOASProgressionRows(rows, { memberName: "sam" }).map((r) => r.memberName)).toEqual(["Sam Ranger"]);
    expect(filterOASProgressionRows(rows, { iStatement: "NAVIGATE" }).map((r) => r.memberName)).toEqual(["Sam Ranger"]);
    // Two column filters ANDed together — both must match the same row.
    expect(filterOASProgressionRows(rows, { memberName: "sam", stream: "bushwalking" }).map((r) => r.memberName)).toEqual(["Sam Ranger"]);
    expect(filterOASProgressionRows(rows, { memberName: "sam", stream: "bushcraft" })).toEqual([]);
    expect(filterOASProgressionRows(rows, { memberName: "nonexistent" })).toEqual([]);
  });

  it("dropdown-style exact-value filters work correctly, fixing the reported bug where the Answered/Awarded filter boxes never matched typed Y/N/yes/no (the UI now emits the dropdown's own exact 'true'/'false' value instead of free text)", () => {
    const rows = [makeRow({ memberName: "Answered Row", answered: true, awarded: false }), makeRow({ memberName: "Unanswered Row", answered: false, awarded: false })];

    expect(filterOASProgressionRows(rows, { answered: "true" }).map((r) => r.memberName)).toEqual(["Answered Row"]);
    expect(filterOASProgressionRows(rows, { answered: "false" }).map((r) => r.memberName)).toEqual(["Unanswered Row"]);
    expect(filterOASProgressionRows(rows, { awarded: "false" }).map((r) => r.memberName)).toEqual(["Answered Row", "Unanswered Row"]);

    const stageRows = [makeRow({ memberName: "Stage 3", stage: 3 }), makeRow({ memberName: "Stage 7", stage: 7 })];
    expect(filterOASProgressionRows(stageRows, { stage: "3" }).map((r) => r.memberName)).toEqual(["Stage 3"]);
  });

  it("template formats the date column through formatDate rather than showing the raw value", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain("#item.date");
    expect(source).toContain("formatDate(item.date)");
  });

  it("formatDate trims a full ISO timestamp down to just the date, and handles null", () => {
    const vm = new Vue(OASProgressionTableVueOptions) as unknown as { formatDate: (date: string | null) => string };

    expect(vm.formatDate("2024-02-03T06:33:41.791295+00:00")).toBe("2024-02-03");
    expect(vm.formatDate("2020-11-18")).toBe("2020-11-18");
    expect(vm.formatDate(null)).toBe("");
  });

  it("rows-per-page dropdown offers 10/25/50/100/All, matching the table's own default of 25 (fixes the dropdown defaulting to Vuetify's stock 5/10/15/All list, which had no 25 entry)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
    expect(source).toContain(':items-per-page="25"');
    expect(source).toContain("itemsPerPageOptions: [10, 25, 50, 100, -1]");
  });
});
