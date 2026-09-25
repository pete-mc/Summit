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

  // Diverges from the React page, which gates this on hasAnyEmptySections. Now that the filter
  // also hides empty trunk sections, it is always shown so its position in the Display group
  // doesn't shift as data loads.
  it("shows Hide-empty-skills unconditionally, unlike the React page's gated version", () => {
    expect(templateSource).toContain('label="Hide empty skills"');
    expect(templateSource).not.toContain('v-if="hasAnyEmptySections"');
  });

  it("uses real Vuetify form controls, not hand-rolled equivalents", () => {
    ["v-text-field", "v-select", "v-checkbox", "v-btn"].forEach((control) => {
      expect(templateSource).toContain(`<${control}`);
    });
  });

  it("resets the Display group's <fieldset> border/padding/margin, since a bare fieldset carries the browser's own default border (reported live as a stray line around the checkbox row)", () => {
    expect(templateSource).toMatch(/\.oas-heatmap-display-group\s*\{[^}]*border:\s*none/);
  });

  it("the Display fieldset does NOT carry the shared .oas-field class — that class's ::after rule (a 1px divider drawn after every non-last .oas-field, from src/styles/index.css) was the real source of the reported stray line, confirmed via the user's own DevTools inspector output", () => {
    expect(templateSource).not.toContain('class="oas-field oas-heatmap-display-group"');
    expect(templateSource).toContain('class="oas-heatmap-display-group"');
  });

  it("Member's v-text-field has no separate placeholder — a floating label (like Skills/Patrol/Stage/Sort by) is enough, and duplicating it as a placeholder was redundant", () => {
    const memberField = templateSource.slice(templateSource.indexOf("<v-text-field"), templateSource.indexOf("</v-text-field>"));
    expect(memberField).toContain('label="Member"');
    expect(memberField).not.toContain("placeholder=");
  });

  it("Display's legend and Member's label share ONE identical set of styling values (color, font-size, font-family, font-weight, letter-spacing) — not each element's own distinct native Terrain rule, per explicit instruction that all filter headings on this row must look the same", () => {
    const SHARED_VALUES = {
      color: /color:\s*var\(--color-scouts-medium-blue,\s*#00348d\)\s*!important/,
      fontSize: /font-size:\s*var\(--oas-vue-font-size-heading\)\s*!important/,
      fontFamily: /font-family:\s*var\(--oas-vue-font-family\)\s*!important/,
      fontWeight: /font-weight:\s*normal\s*!important/,
      letterSpacing: /letter-spacing:\s*-0\.01em\s*!important/,
    };

    expect(templateSource).toContain('class="oas-heatmap-filter-label oas-vue-filter-heading-match"');

    const sharedClassBlock = templateSource.slice(templateSource.indexOf(".oas-vue-filter-heading-match {"), templateSource.indexOf(".oas-vue-filter-heading-match {") + 300);
    const memberLabelBlock = templateSource.slice(templateSource.indexOf(".oas-heatmap-controls ::v-deep .v-text-field .v-label {"), templateSource.indexOf(".oas-heatmap-controls ::v-deep .v-text-field .v-label {") + 400);

    Object.values(SHARED_VALUES).forEach((pattern) => {
      expect(sharedClassBlock).toMatch(pattern);
      expect(memberLabelBlock).toMatch(pattern);
    });
  });

  it("the heat-map's own filter fields (Member/Skills/Patrol/Stage/Sort by) match the shared body text size/family used across both views' tables and filter boxes, overriding the global 20px rule found on the Table view's filter boxes", () => {
    expect(templateSource).toMatch(
      /\.oas-heatmap-controls ::v-deep \.v-text-field input,\s*\.oas-heatmap-controls ::v-deep \.v-select__selection\s*\{[^}]*font-size:\s*var\(--oas-vue-font-size-body\)\s*!important;\s*font-family:\s*var\(--oas-vue-font-family\)\s*!important/,
    );
  });

  it("Member's label is forced into the permanently-floated (small, above-the-box) position, since Vuetify only floats it once the field has focus/a value", () => {
    expect(templateSource).toMatch(/\.oas-heatmap-controls ::v-deep \.v-text-field \.v-label\s*\{[^}]*transform:\s*translateY\(-18px\) scale\(0\.75\)/);
  });

  it("Display checkbox label spacing (12px) beats Terrain's own page-level checkbox restyling rule via !important, since that rule's selector specificity ties with ours and cascade order alone wasn't reliably deciding the winner — confirmed via live DevTools (the actual winning rule was `.v-application.theme--light .v-input--checkbox .v-input--selection-controls__input { margin-right: 24px; ... }`, not Vuetify's own 8px default)", () => {
    expect(templateSource).toMatch(/\.oas-heatmap-display-group ::v-deep \.v-input--selection-controls__input\s*\{[^}]*margin-right:\s*12px\s*!important/);
  });
});
