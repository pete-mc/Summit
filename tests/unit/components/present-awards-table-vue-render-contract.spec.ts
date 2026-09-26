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

  it("labels both interactive cells for screen readers", () => {
    expect(TEMPLATE).toContain("aria-label");
    expect(TEMPLATE).toContain("Mark ${item.achievementName} as presented");
    expect(TEMPLATE).toContain("Change presentation date for ${item.achievementName}");
  });
});
