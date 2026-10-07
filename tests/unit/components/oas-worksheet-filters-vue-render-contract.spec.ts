import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/**
 * OASWorksheetFiltersVue.ts is NOT imported live here: its template is what actually exercises
 * its v-if gating, same constraint as OASProgressionFiltersVue's own render-contract test (see
 * that file's comment for the full "why" — no @vue/test-utils in this build).
 */
describe("OASWorksheetFiltersVue wiring and gating rules", () => {
  const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetFiltersVue.ts"), "utf8");
  const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetFiltersVue.vue"), "utf8");

  // Added per DEV_NOTES.md: "Add exact same Patrol filter as per Heatmap, with same defaults" —
  // see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md. Same control, same gating
  // computed, same binding pattern as OASProgressionFiltersVue.vue's own Patrol select, but
  // against worksheetSelectedPatrols (independent state from the Heat Map's selectedPatrols).
  it("has a Patrol multi-select gated on canFilterByPatrol, bound to filters.worksheetSelectedPatrols", () => {
    expect(templateSource).toContain('v-if="canFilterByPatrol"');
    expect(templateSource).toContain(':value="filters.worksheetSelectedPatrols || []"');
    expect(templateSource).toContain(':items="patrolFilterOptions"');
    expect(templateSource).toContain('@change="patch({ worksheetSelectedPatrols: $event })"');
  });

  it("declares patrolFilterOptions and canFilterByPatrol as props, matching OASProgressionFiltersVue's own", () => {
    expect(tsSource).toContain("patrolFilterOptions: { type: Array as PropType<string[]>, required: true }");
    expect(tsSource).toContain("canFilterByPatrol: { type: Boolean, default: true }");
  });

  it("emits update:filters (patched state) rather than mutating the filters prop directly", () => {
    expect(tsSource).toContain('this.$emit("update:filters"');
    expect(tsSource).toContain("...this.filters");
  });

  it("emits a separate reset event rather than computing defaults itself (the parent owns persistence)", () => {
    expect(tsSource).toContain('this.$emit("reset")');
  });

  it("uses the shared NameFormatSelect component, bound to filters.worksheetNameFormat", () => {
    expect(templateSource).toContain("<NameFormatSelect");
    expect(templateSource).toContain(':value="filters.worksheetNameFormat"');
  });

  it("groups the Show dropdown's items under Members/Grouping subheaders", () => {
    expect(tsSource).toContain('{ header: "Members" }');
    expect(tsSource).toContain('{ header: "Grouping" }');
    expect(tsSource).toContain("{ divider: true }");
  });
});
