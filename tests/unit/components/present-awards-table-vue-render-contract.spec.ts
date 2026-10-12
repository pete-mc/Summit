import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const TEMPLATE = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/PresentAwardsVue/components/PresentAwardsTableVue.vue"), "utf8");

/**
 * Jest cannot import .vue files in this project, so these assert the structural decisions that
 * were expensive to arrive at — each one guards a specific bug documented in
 * .claude/OASProgression/PLAN_VUESTAGE_5.md and .claude/PresentAwardsVue/PLAN_STAGE_2.md.
 */
describe("PresentAwardsTableVue render contract", () => {
  it("renders the filter row via #body.prepend, not a header slot", () => {
    // header.<value> slots can only customize a cell within the existing header <tr>; they
    // cannot emit a sibling row.
    expect(TEMPLATE).toContain("#body.prepend");
    expect(TEMPLATE).not.toContain("#header.");
  });

  it("uses v-simple-checkbox rather than v-checkbox in the cell", () => {
    // v-checkbox brings a label/validation wrapper with a min-height that stretches a dense row.
    expect(TEMPLATE).toContain("<v-simple-checkbox");
    expect(TEMPLATE).not.toContain("<v-checkbox");
  });

  it("keeps the date menu open until a date is chosen", () => {
    // Without this the menu closes on the first click inside the picker.
    expect(TEMPLATE).toContain(':close-on-content-click="false"');
  });

  it("renders the table from the filtered rows, not the raw items", () => {
    expect(TEMPLATE).toContain(':items="filteredItems"');
  });

  it("uses ::v-deep wherever it targets a Vuetify-internal element", () => {
    // Vue 2 scoped CSS stamps data-v-* onto the rightmost compound selector and only onto
    // elements this template writes, so these can never match without ::v-deep.
    const vuetifyInternals = [".v-input__slot", ".v-select__selection", ".v-input__icon--clear", "tbody td"];
    vuetifyInternals.forEach((selector) => {
      const rules = TEMPLATE.split("\n").filter((line) => line.includes(selector) && !line.trimStart().startsWith("*") && !line.trimStart().startsWith("/*"));
      expect(rules.length).toBeGreaterThan(0);
      rules.forEach((rule) => expect(rule).toContain("::v-deep"));
    });
  });

  it("overrides the two global 20px font rules with !important", () => {
    // Neither global rule is itself !important, so an equal-specificity override still loses.
    const fontRule = TEMPLATE.split("\n").find((line) => line.includes("font-size: var(--oas-vue-font-size-body) !important"));
    expect(fontRule).toBeDefined();
  });

  it("opts the filter row out of v-data-table's row hover highlight", () => {
    expect(TEMPLATE).toContain(".oas-vue-column-filter-row:hover");
    expect(TEMPLATE).toContain("background: transparent !important");
  });

  it("keeps the clear icon visible on touch devices", () => {
    expect(TEMPLATE).toContain(".v-input__icon--clear");
    expect(TEMPLATE).toContain("opacity: 1 !important");
  });

  it("renders a badge icon (with a placeholder fallback) inside the Award cell, before the name", () => {
    // Part of the Award column rather than a column of its own (user, 2026-10-12). A missing icon
    // must still occupy its fixed-width slot, or the award names stop lining up.
    expect(TEMPLATE).toContain("#item.achievementName");
    expect(TEMPLATE).not.toContain("#item.badge");
    expect(TEMPLATE).toContain("present-awards-badge-slot");
    expect(TEMPLATE).toContain("present-awards-badge-icon");
    expect(TEMPLATE).toContain("present-awards-badge-placeholder");
    expect(TEMPLATE.indexOf("present-awards-badge-slot")).toBeLessThan(TEMPLATE.indexOf("present-awards-award-name"));
  });

  it("builds the filter row and group colspan from the rendered headers, not the raw ones", () => {
    // Vuetify drops the grouped column from its own header row (computedHeaders filters it out —
    // VDataTable.js:126), so iterating the raw `headers` emits one <th> too many and shifts every
    // filter box left of its column while grouping is on.
    expect(TEMPLATE).toContain('v-for="header in renderedHeaders"');
    expect(TEMPLATE).toContain(':colspan="renderedHeaders.length"');
    expect(TEMPLATE).not.toContain('v-for="header in headers"');
    expect(TEMPLATE).not.toContain(':colspan="headers.length"');
  });

  it("takes the group count from the component, not the slot's paginated items", () => {
    // VData paginates before grouping, so the slot's own `items` is only the current page's
    // share of a member's awards — groupLabel must not be handed them.
    expect(TEMPLATE).toContain("groupLabel(group)");
    expect(TEMPLATE).not.toContain("groupLabel(group,");
  });

  it("labels both interactive cells for screen readers", () => {
    expect(TEMPLATE).toContain("aria-label");
    expect(TEMPLATE).toContain("Mark ${item.achievementName} as presented");
    expect(TEMPLATE).toContain("Change presentation date for ${item.achievementName}");
  });
});
