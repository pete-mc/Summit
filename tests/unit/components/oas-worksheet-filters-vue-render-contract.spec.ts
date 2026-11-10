import * as fs from "fs";
import * as path from "path";
jest.mock("@/components/NameFormatSelect.vue", () => ({ __esModule: true, default: { name: "NameFormatSelect", render: () => null } }), { virtual: true });
import OASWorksheetFiltersVue from "@/pages/OasProgressVue/components/OASWorksheetFiltersVue";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Gating lives in the template (no @vue/test-utils), so these are source-text checks. */
describe("OASWorksheetFiltersVue wiring and gating rules", () => {
  const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASWorksheetFiltersVue.ts"), "utf8");
  const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASWorksheetFiltersVue.vue"), "utf8");

  // Same Patrol control as the Heat Map, bound to its own worksheetSelectedPatrols.
  it("has a Patrol multi-select gated on canFilterByPatrol, bound to filters.worksheetSelectedPatrols", () => {
    expect(templateSource).toContain('v-if="canFilterByPatrol"');
    expect(templateSource).toContain(':value="filters.worksheetSelectedPatrols || []"');
    expect(templateSource).toContain(':items="patrolFilterOptions"');
    expect(templateSource).toContain('@change="patch({ worksheetSelectedPatrols: $event })"');
  });

  it("declares patrolFilterOptions and canFilterByPatrol as props, matching OASProgressFiltersVue's own", () => {
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

  it("has a single-choice Skill dropdown of Skill - Stream combos, shown with radio icons", () => {
    const skillSelect = templateSource.slice(templateSource.indexOf(':value="skillStream"'), templateSource.indexOf("</v-select>", templateSource.indexOf(':value="skillStream"')));
    expect(skillSelect).toContain(':items="skillStreamOptions"');
    expect(skillSelect).toContain('@change="patch({ worksheetSkillStream: $event })"');
    expect(skillSelect).not.toContain("multiple");
    expect(skillSelect).toContain("mdi-radiobox-marked");

    const options = (OASWorksheetFiltersVue as unknown as { computed: { skillStreamOptions(this: unknown): unknown } }).computed.skillStreamOptions;
    expect(options.call({ skillStreams: [{ key: "camping::camping", skill: "camping", stream: "camping", label: "Camping" }] })).toEqual([{ value: "camping::camping", text: "Camping" }]);
  });

  it("groups the Show dropdown's items under Members/Grouping subheaders", () => {
    expect(tsSource).toContain('{ header: "Members" }');
    expect(tsSource).toContain('{ header: "Grouping" }');
    expect(tsSource).toContain("{ divider: true }");
  });
});
