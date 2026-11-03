import Vue from "vue";
import * as fs from "fs";
import * as path from "path";
import OASProgressTableVueOptions, { buildTableRows, filterOASProgressRows, listTableMembers, skillStreamLabel, type OASTableRow } from "@/pages/OasProgressVue/components/OASProgressTableVue";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";

/** No .vue import in its chain, so it can be `new Vue(options)`'d; the template is checked as source text. */

const REPO_ROOT = path.resolve(__dirname, "../../..");

function makeRow(overrides: Partial<OASProgressRow> = {}): OASProgressRow {
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
    firstName: "Alex",
    lastName: "Scout",
    patrolName: null,
    answered: true,
    awarded: false,
    date: "2020-11-18",
    section: null,
    ...overrides,
  };
}

function makeTableRow(overrides: Partial<OASProgressRow> = {}): OASTableRow {
  const row = makeRow(overrides);
  return { ...row, skillStream: skillStreamLabel(row) };
}

const TABLE_FIELDS = ["memberName", "skillStream", "stage", "inputGroup", "iStatement", "answered", "awarded", "date"];

describe("OASProgressTableVue render contract", () => {
  it("declares the items/columnFilters props and default headers state", () => {
    const items = [makeRow()];
    const vm = new Vue({
      ...OASProgressTableVueOptions,
      propsData: { items },
    }) as unknown as { items: OASProgressRow[]; columnFilters: Record<string, string>; headers: Array<{ text: string; value: string }> };

    expect(vm.items).toEqual(items);
    expect(vm.columnFilters).toEqual({});
    expect(vm.headers.map((h) => h.value)).toEqual(TABLE_FIELDS);
  });

  it("Skill/Stage/Group/Answered/Awarded are dropdown filters; Member is the single-member picker; I-Statement/Date stay text", () => {
    const vm = new Vue({
      ...OASProgressTableVueOptions,
      propsData: { items: [] },
    }) as unknown as { headers: Array<{ value: string; filterType?: string }> };

    const selectColumns = vm.headers.filter((h) => h.filterType === "select").map((h) => h.value);
    const textColumns = vm.headers.filter((h) => !h.filterType || h.filterType === "text").map((h) => h.value);

    expect(selectColumns.sort()).toEqual(["answered", "awarded", "inputGroup", "skillStream", "stage"].sort());
    expect(textColumns.sort()).toEqual(["date", "iStatement"].sort());
    expect(vm.headers.filter((h) => h.filterType === "member").map((h) => h.value)).toEqual(["memberName"]);
  });

  it("columnFilterOptions: Stage is 1-9, Answered/Awarded are Yes(true)/No(false), Skill/Group are derived from ALL loaded items (not filtered)", () => {
    const items = [makeRow({ inputGroup: "Plan", branch: "navigation" }), makeRow({ inputGroup: "Do", branch: "safety", memberId: "member-2" }), makeRow({ inputGroup: "Plan", branch: "navigation" })];
    const vm = new Vue({
      ...OASProgressTableVueOptions,
      propsData: { items, memberId: "member-1", columnFilters: { iStatement: "nonexistent" } },
    }) as unknown as { columnFilterOptions: Record<string, Array<{ text: string; value: string }>> };

    expect(vm.columnFilterOptions.stage.map((o) => o.value)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    expect(vm.columnFilterOptions.answered).toEqual([
      { text: "Yes", value: "true" },
      { text: "No", value: "false" },
    ]);
    expect(vm.columnFilterOptions.awarded).toEqual(vm.columnFilterOptions.answered);
    // Derived from `items`, not `filteredItems`: options must not change with the selected member or other filters.
    expect(vm.columnFilterOptions.skillStream.map((o) => o.value)).toEqual(["Bushwalking - Navigation", "Bushwalking - Safety"]);
    expect(vm.columnFilterOptions.inputGroup.map((o) => o.value).sort()).toEqual(["Do", "Plan"]);
  });

  it("template wires v-data-table to the filtered items, a per-column filter row (body.prepend, lifted to the parent via update:columnFilters), and Yes/No cells for booleans", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain("<v-data-table");
    expect(source).toContain(':items="filteredItems"');
    expect(source).not.toContain(':search="search"');
    expect(source).toContain("#body.prepend");
    expect(source).toContain('v-for="header in headers"');
    expect(source).toContain(':value="columnFilters[header.value]');
    expect(source).toContain("onColumnFilterInput(header.value");
    expect(source).toContain("#item.answered");
    expect(source).toContain("#item.awarded");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.ts"), "utf8");
    expect(tsSource).toContain('this.$emit("update:columnFilters"');
  });

  it("template renders a v-select for dropdown columns (bound to columnFilterOptions) and a v-text-field with a search icon for text columns", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain("<v-select");
    expect(source).toContain("v-else-if=\"header.filterType === 'select'\"");
    expect(source).toContain(':items="columnFilterOptions[header.value]"');
    expect(source).toContain('prepend-inner-icon="mdi-magnify"');
  });

  it("filter row inputs use solo/flat (no underline) and no placeholder text (the column header above already labels each box)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain("oas-vue-column-filter-input");
    expect(source).toMatch(/<v-select[^>]*\bsolo\b/);
    expect(source).toMatch(/<v-text-field[^>]*\bsolo\b/);
    expect(source).not.toContain(":placeholder=");
  });

  it("both v-text-field's <input> and v-select's selected-value text override global 20px font-size rules (.v-application .theme--light.v-text-field input, .v-application .v-select__selection--comma), matched to the shared body text size", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toMatch(/\.oas-vue-column-filter-input\.v-text-field ::v-deep input,\s*\.oas-vue-column-filter-input\.v-select ::v-deep \.v-select__selection\s*\{[^}]*font-size:\s*var\(--oas-vue-font-size-body\)\s*!important/);
  });

  it("filter row opts out of v-data-table's own row-hover highlight, and filter boxes get a solid (not translucent) background — fixes the reported bug where boxes were invisible on a white row and only visible once the row's own hover state turned it grey", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toMatch(/\.oas-vue-column-filter-row:hover\s*\{[^}]*background:\s*transparent\s*!important/);
    expect(source).toMatch(/\.oas-vue-column-filter-input ::v-deep \.v-input__slot\s*\{[^}]*background-color:\s*#eceff1\s*!important/);
  });

  it("every rule reaching into a Vuetify-internal descendant element (not one this component's own template writes) uses ::v-deep — Vue 2's scoped CSS only stamps data-v-* onto elements the template itself creates, so a plain descendant selector can never match Vuetify's own internal render output", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    ["v-input__control", "v-input__slot", "v-select__selection", "v-icon"].forEach((internalClass) => {
      expect(source).toMatch(new RegExp(`::v-deep \\.${internalClass}\\b`));
    });
  });

  it("clearable 'x' icon is always visible once a filter has a value, not just on hover/focus (Vuetify's default is unreachable on touch/mobile, which has no hover state)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toMatch(/\.oas-vue-column-filter-input\.v-input--is-dirty ::v-deep \.v-input__icon--clear\s*\{[^}]*opacity:\s*1\s*!important/);
  });

  it("the Clear filters button sits in a fixed-height wrapper so its appearance/disappearance doesn't shift the table up/down", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain('<div class="oas-vue-clear-filters-row">');
    expect(source).toMatch(/\.oas-vue-clear-filters-row\s*\{[^}]*min-height/);
  });

  it("template shows a Clear filters button only when a column filter is active", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain('v-if="hasActiveColumnFilters"');
    expect(source).toContain("onClearFiltersClick");
    expect(source).toContain("Clear filters");
  });

  it("filterOASProgressRows ANDs every non-empty column filter; text columns are case-insensitive substrings; empty/missing filters are no-ops", () => {
    const rows = [
      makeTableRow({ memberName: "Alex Scout", iStatement: "I can pack a bag", stream: "bushcraft", branch: "bushcraft" }),
      makeTableRow({ memberName: "Sam Ranger", iStatement: "I can navigate with a map", stream: "bushwalking", branch: "bushwalking" }),
    ];

    expect(filterOASProgressRows(rows)).toEqual(rows);
    expect(filterOASProgressRows(rows, {})).toEqual(rows);
    expect(filterOASProgressRows(rows, { iStatement: "  " })).toEqual(rows);
    expect(filterOASProgressRows(rows, { iStatement: "NAVIGATE" }).map((r) => r.memberName)).toEqual(["Sam Ranger"]);
    expect(filterOASProgressRows(rows, { iStatement: "I can", skillStream: "Bushwalking" }).map((r) => r.memberName)).toEqual(["Sam Ranger"]);
    expect(filterOASProgressRows(rows, { iStatement: "navigate", skillStream: "Bushcraft" })).toEqual([]);
  });

  it("dropdown filters match exactly, so a skill's trunk label does not also pull in its streams", () => {
    const rows = [makeTableRow({ memberName: "Trunk", stream: "camping", branch: "camping" }), makeTableRow({ memberName: "Stream", stream: "camping", branch: "lightweight-camping" })];

    expect(filterOASProgressRows(rows, { skillStream: "Camping" }).map((r) => r.memberName)).toEqual(["Trunk"]);
    expect(filterOASProgressRows(rows, { skillStream: "Camping - Lightweight Camping" }).map((r) => r.memberName)).toEqual(["Stream"]);
  });

  it("skillStreamLabel shows just the skill for trunk stages and Skill - Stream otherwise", () => {
    expect(skillStreamLabel(makeRow({ stream: "vertical", branch: "vertical" }))).toBe("Vertical");
    expect(skillStreamLabel(makeRow({ stream: "vertical", branch: "abseiling" }))).toBe("Vertical - Abseiling");
  });

  it("skillStream options follow OAS skill order, trunk before its streams", () => {
    const items = [makeRow({ stream: "vertical", branch: "climbing" }), makeRow({ stream: "vertical", branch: "vertical" }), makeRow({ stream: "bushcraft", branch: "bushcraft" }), makeRow({ stream: "vertical", branch: "abseiling" })];
    const vm = new Vue({ ...OASProgressTableVueOptions, propsData: { items, memberId: "member-1" } }) as unknown as { columnFilterOptions: Record<string, Array<{ value: string }>> };

    expect(vm.columnFilterOptions.skillStream.map((o) => o.value)).toEqual(["Bushcraft", "Vertical", "Vertical - Abseiling", "Vertical - Climbing"]);
  });

  it("listTableMembers lists each member once, sorted by first then last name", () => {
    const items = [
      makeRow({ memberId: "m3", memberName: "Sam Ranger", firstName: "Sam", lastName: "Ranger" }),
      makeRow({ memberId: "m1", memberName: "Alex Van Der Berg", firstName: "Alex", lastName: "Van Der Berg" }),
      makeRow({ memberId: "m3", memberName: "Sam Ranger", firstName: "Sam", lastName: "Ranger" }),
      makeRow({ memberId: "m2", memberName: "Alex Scout", firstName: "Alex", lastName: "Scout" }),
    ];

    expect(listTableMembers(items)).toEqual([
      { text: "Alex Scout", value: "m2" },
      { text: "Alex Van Der Berg", value: "m1" },
      { text: "Sam Ranger", value: "m3" },
    ]);
  });

  it("only the selected member's rows reach the table", () => {
    const items = [makeRow({ memberId: "m1", iStatement: "one" }), makeRow({ memberId: "m2", iStatement: "two" })];
    expect(buildTableRows(items, "m2").map((r) => r.iStatement)).toEqual(["two"]);

    const vm = new Vue({ ...OASProgressTableVueOptions, propsData: { items, memberId: "m1" } }) as unknown as { filteredItems: OASTableRow[] };
    expect(vm.filteredItems.map((r) => r.iStatement)).toEqual(["one"]);
  });

  it("the Member picker is a non-clearable type-to-search box that never emits an empty selection", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    const autocomplete = source.match(/<v-autocomplete[\s\S]*?<\/v-autocomplete>/)?.[0] ?? "";
    expect(autocomplete).toContain("v-if=\"header.filterType === 'member'\"");
    expect(autocomplete).toContain(':items="memberOptions"');
    expect(autocomplete).not.toContain("clearable");

    const emit = jest.fn();
    const onMemberChange = (OASProgressTableVueOptions as unknown as { methods: { onMemberChange(this: unknown, id: string | null): void } }).methods.onMemberChange;
    onMemberChange.call({ $emit: emit }, null);
    onMemberChange.call({ $emit: emit }, "");
    expect(emit).not.toHaveBeenCalled();
    onMemberChange.call({ $emit: emit }, "m2");
    expect(emit).toHaveBeenCalledWith("update:memberId", "m2");
  });

  it("dropdown-style exact-value filters work correctly, fixing the reported bug where the Answered/Awarded filter boxes never matched typed Y/N/yes/no (the UI now emits the dropdown's own exact 'true'/'false' value instead of free text)", () => {
    const rows = [makeTableRow({ memberName: "Answered Row", answered: true, awarded: false }), makeTableRow({ memberName: "Unanswered Row", answered: false, awarded: false })];

    expect(filterOASProgressRows(rows, { answered: "true" }).map((r) => r.memberName)).toEqual(["Answered Row"]);
    expect(filterOASProgressRows(rows, { answered: "false" }).map((r) => r.memberName)).toEqual(["Unanswered Row"]);
    expect(filterOASProgressRows(rows, { awarded: "false" }).map((r) => r.memberName)).toEqual(["Answered Row", "Unanswered Row"]);

    const stageRows = [makeTableRow({ memberName: "Stage 3", stage: 3 }), makeTableRow({ memberName: "Stage 7", stage: 7 })];
    expect(filterOASProgressRows(stageRows, { stage: "3" }).map((r) => r.memberName)).toEqual(["Stage 3"]);
  });

  it("template formats the date column through formatDate rather than showing the raw value", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain("#item.date");
    expect(source).toContain("formatDate(item.date)");
  });

  it("formatDate trims a full ISO timestamp down to just the date, and handles null", () => {
    const vm = new Vue(OASProgressTableVueOptions) as unknown as { formatDate: (date: string | null) => string };

    expect(vm.formatDate("2024-02-03T06:33:41.791295+00:00")).toBe("2024-02-03");
    expect(vm.formatDate("2020-11-18")).toBe("2020-11-18");
    expect(vm.formatDate(null)).toBe("");
  });

  it("rows-per-page dropdown offers 10/25/50/100/All, matching the table's own default of 25 (fixes the dropdown defaulting to Vuetify's stock 5/10/15/All list, which had no 25 entry)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.vue"), "utf8");
    expect(source).toContain(':items-per-page.sync="itemsPerPage"');
    const ts = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASProgressTableVue.ts"), "utf8");
    expect(ts).toContain("export const DEFAULT_ITEMS_PER_PAGE = 25;");
    expect(source).toContain("itemsPerPageOptions: [10, 25, 50, 100, -1]");
  });
});
