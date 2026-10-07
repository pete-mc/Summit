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

  // Changed from a bare `availablePatrols.length > 0` check: with exactly one named patrol and
  // no unassigned members, the Patrol filter had no real choice to offer and a single-item
  // multi-select could never actually reach its own "filtered" state — see
  // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md's note on the Patrol filter bug.
  it("gates the Patrol filter on canFilterByPatrol, not a bare availablePatrols check", () => {
    expect(templateSource).toContain('v-if="canFilterByPatrol"');
    expect(tsSource).toContain("canFilterByPatrol");
  });

  // A reconciliation method (onPatrolsChange) and a display-substitution computed
  // (selectedPatrolsForDisplay) were tried first and both removed — the display/storage split
  // they created is what caused the original bug, and it can't be patched around for a
  // single-item list. The Patrol select is now a plain, honest multi-select bound directly to
  // filters.selectedPatrols, with "Unassigned" as a real selectable item
  // (patrolFilterOptions) rather than inferred. See
  // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
  it("binds the Patrol multi-select directly to filters.selectedPatrols with a plain patch() on change", () => {
    expect(templateSource).toContain(':value="filters.selectedPatrols || []"');
    expect(templateSource).toContain(':items="patrolFilterOptions"');
    expect(templateSource).toContain('@change="patch({ selectedPatrols: $event })"');
    expect(tsSource).not.toContain("onPatrolsChange");
    expect(tsSource).not.toContain("selectedPatrolsForDisplay");
  });

  // The old "Use codenames"/"Hide last name" checkboxes (one disabling the other) were replaced
  // by the single-select NameFormatSelect dropdown — see
  // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md. Exclusivity is now structural (one
  // dropdown value) rather than a disabled-state rule to assert on.
  it("uses the shared NameFormatSelect component for the Names control, bound to filters.nameFormat", () => {
    expect(templateSource).toContain("<NameFormatSelect");
    expect(templateSource).toContain(':value="filters.nameFormat"');
    expect(tsSource).toContain("NameFormatSelect");
  });

  // The Skills select's own chips row was removed (doubled up on the control itself) but the
  // select is restored — only hiding the control entirely was a mistake in an earlier pass. See
  // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
  it("keeps the Skills multi-select but not its selected-skill chip row", () => {
    expect(templateSource).toContain('label="Skills"');
    expect(templateSource).toContain(':value="filters.visibleStreams"');
    expect(templateSource).not.toContain("oas-vue-selected-skills");
  });

  // The original "Hide" dropdown (a double negative) was inverted into a positive-selection
  // "Show" dropdown, all-on by default — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
  // It also absorbed "Break by patrol", the sole remaining item from the old Display fieldset,
  // which is removed entirely.
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

  // Renamed twice: "Empty skills rows" → "Empty skills" in the first pass, then
  // DEV_NOTES.md asked for "Empty Skills" → "Not Started" (the Skills-section item, not the
  // I-Statement "Not started" state option — the underlying field, showEmptySkillRows, is
  // unchanged both times).
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
