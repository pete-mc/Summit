import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/**
 * OASProgressionFiltersVue.ts is NOT imported live: unlike OASHeatMapVue.ts (a pure Vue options
 * object with no .vue imports, safe to `new Vue.extend(...)`), this component's template is what
 * actually exercises its gating logic (v-if on availablePatrols.length, etc.) — testing that
 * properly needs @vue/test-utils, not installed here (see PLAN_VUESTAGE_1.md's "Deviations"
 * note). Source-text assertions confirm the wiring/gating rules are present as written, matching
 * this build's established fallback approach.
 */
describe("OASProgressionFiltersVue wiring and gating rules", () => {
  const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionFiltersVue.ts"), "utf8");
  const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue"), "utf8");

  it("emits update:filters (patched state) rather than mutating the filters prop directly", () => {
    expect(tsSource).toContain('this.$emit("update:filters"');
    expect(tsSource).toContain("...this.filters");
  });

  it("emits a separate reset event rather than computing DEFAULT_FILTERS itself (the parent owns persistence)", () => {
    expect(tsSource).toContain('this.$emit("reset")');
  });

  it("gates the Patrol filter and Break-by-patrol toggle on availablePatrols being non-empty, matching the React page's rule", () => {
    expect(templateSource).toContain('v-if="availablePatrols.length > 0"');
  });

  it("gates Hide-last-name disabled state on useCodenames, matching the React page's precedence rule", () => {
    expect(templateSource).toContain(':disabled="filters.useCodenames"');
  });

  it("gates Hide-empty-streams on hasAnyEmptySections, matching the React page's rule", () => {
    expect(templateSource).toContain('v-if="hasAnyEmptySections"');
  });

  it("uses real Vuetify form controls, not hand-rolled equivalents", () => {
    ["v-text-field", "v-select", "v-checkbox", "v-btn"].forEach((control) => {
      expect(templateSource).toContain(`<${control}`);
    });
  });
});
