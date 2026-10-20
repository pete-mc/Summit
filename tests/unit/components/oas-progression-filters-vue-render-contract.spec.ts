import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Gating lives in the template, which needs @vue/test-utils (not installed), so these are source-text checks. */
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

  // Regression: with one patrol and nobody unassigned, the filter had nothing to choose between.
  it("gates the Patrol filter on canFilterByPatrol, not a bare availablePatrols check", () => {
    expect(templateSource).toContain('v-if="canFilterByPatrol"');
    expect(tsSource).toContain("canFilterByPatrol");
  });

  // Learning: a display/storage split caused the original bug. Keep a plain multi-select bound to filters.selectedPatrols.
  it("binds the Patrol multi-select directly to filters.selectedPatrols with a plain patch() on change", () => {
    expect(templateSource).toContain(':value="filters.selectedPatrols || []"');
    expect(templateSource).toContain(':items="patrolFilterOptions"');
    expect(templateSource).toContain('@change="patch({ selectedPatrols: $event })"');
    expect(tsSource).not.toContain("onPatrolsChange");
    expect(tsSource).not.toContain("selectedPatrolsForDisplay");
  });

  it("uses the shared NameFormatSelect component for the Names control, bound to filters.nameFormat", () => {
    expect(templateSource).toContain("<NameFormatSelect");
    expect(templateSource).toContain(':value="filters.nameFormat"');
    expect(tsSource).toContain("NameFormatSelect");
  });

  it("keeps the Skills multi-select but not its selected-skill chip row", () => {
    expect(templateSource).toContain('label="Skills"');
    expect(templateSource).toContain(':value="filters.visibleStreams"');
    expect(templateSource).not.toContain("oas-vue-selected-skills");
  });

  it("uses a multi-select Show dropdown, not a Hide dropdown or the old Display fieldset", () => {
    expect(templateSource).toContain('label="Show"');
    expect(templateSource).not.toContain('label="Hide"');
    expect(templateSource).not.toContain("oas-heatmap-display-group");
    expect(templateSource).not.toContain("<fieldset");
    expect(templateSource).not.toContain("<legend");
  });

  it("groups the Show dropdown's items under Skills/I Statements/Grouping subheaders", () => {
    expect(tsSource).toContain('{ header: "Skills" }');
    expect(tsSource).toContain('{ header: "I Statements" }');
    expect(tsSource).toContain('{ header: "Grouping" }');
    expect(tsSource).toContain("{ divider: true }");
  });

  // Label only; the field is still showEmptySkillRows.
  it("the showEmptySkillRows item is labelled 'Not Started'", () => {
    expect(tsSource).toContain('{ value: "showEmptySkillRows", text: "Not Started" }');
    expect(tsSource).not.toContain("Empty skills rows");
    expect(tsSource).not.toContain('text: "Empty skills"');
  });

  it("uses real Vuetify form controls, not hand-rolled equivalents", () => {
    ["v-text-field", "v-select", "v-btn"].forEach((control) => {
      expect(templateSource).toContain(`<${control}`);
    });
  });

  it("Member's v-text-field has no separate placeholder — a floating label (like Skills/Patrol/Stage/Sort by) is enough, and duplicating it as a placeholder was redundant", () => {
    const memberField = templateSource.slice(templateSource.indexOf("<v-text-field"), templateSource.indexOf("</v-text-field>"));
    expect(memberField).toContain('label="Member"');
    expect(memberField).not.toContain("placeholder=");
  });

  it("the heat-map's own filter fields (Member/Skills/Patrol/Stage/Sort by) match the shared body text size/family used across both views' tables and filter boxes, overriding the global 20px rule found on the Table view's filter boxes", () => {
    expect(templateSource).toMatch(
      /\.oas-heatmap-controls ::v-deep \.v-text-field input,\s*\.oas-heatmap-controls ::v-deep \.v-select__selection\s*\{[^}]*font-size:\s*var\(--oas-vue-font-size-body\)\s*!important;\s*font-family:\s*var\(--oas-vue-font-family\)\s*!important/,
    );
  });

  it("Member's label is forced into the permanently-floated (small, above-the-box) position, since Vuetify only floats it once the field has focus/a value", () => {
    expect(templateSource).toMatch(/\.oas-heatmap-controls ::v-deep \.v-text-field \.v-label\s*\{[^}]*transform:\s*translateY\(-18px\) scale\(0\.75\)/);
  });
});
