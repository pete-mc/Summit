import * as fs from "fs";
import * as path from "path";
jest.mock("@/components/NameFormatSelect.vue", () => ({ __esModule: true, default: { name: "NameFormatSelect", render: () => null } }), { virtual: true });
import OASStageGridFiltersVue from "@/pages/OasProgressVue/components/OASStageGridFiltersVue";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Gating lives in the template (no @vue/test-utils), so these are source-text checks. */
describe("OASStageGridFiltersVue wiring and gating rules", () => {
  const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASStageGridFiltersVue.ts"), "utf8");
  const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASStageGridFiltersVue.vue"), "utf8");

  // Same Patrol control as the Heat Map, bound to its own stageGridSelectedPatrols.
  it("has a Patrol multi-select gated on canFilterByPatrol, bound to filters.stageGridSelectedPatrols", () => {
    expect(templateSource).toContain('v-if="canFilterByPatrol"');
    expect(templateSource).toContain(':value="filters.stageGridSelectedPatrols || []"');
    expect(templateSource).toContain(':items="patrolFilterOptions"');
    expect(templateSource).toContain('@change="patch({ stageGridSelectedPatrols: $event })"');
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

  it("uses the shared NameFormatSelect component, bound to filters.stageGridNameFormat", () => {
    expect(templateSource).toContain("<NameFormatSelect");
    expect(templateSource).toContain(':value="filters.stageGridNameFormat"');
  });

  it("has a Sort by dropdown (first or last name), lists Members as columns first, and patches stageGridSortBy", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (OASStageGridFiltersVue as any).data();
    expect(data.sortOptions.map((o: { value: string }) => o.value)).toEqual(["firstName", "lastName"]);
    expect(data.layoutOptions[0].value).toBe("membersAsColumns");
    expect(templateSource).toContain('label="Sort by"');
    expect(templateSource).toContain('@change="patch({ stageGridSortBy: $event })"');
  });

  it("has a single-choice Stage dropdown of the stages this skill has", () => {
    const stageSelect = templateSource.slice(templateSource.indexOf(':value="stage"'), templateSource.indexOf("</v-select>", templateSource.indexOf(':value="stage"')));
    expect(stageSelect).toContain(':items="stageOptions"');
    expect(stageSelect).toContain('@change="patch({ stageGridStage: $event })"');
    expect(stageSelect).not.toContain("multiple");
  });

  it("a new skill keeps the stage on screen, so it stays if the new skill has it", () => {
    const onSkillStreamChange = (OASStageGridFiltersVue as unknown as { methods: { onSkillStreamChange(this: unknown, key: string): void } }).methods.onSkillStreamChange;
    const patch = jest.fn();
    onSkillStreamChange.call({ stage: 3, patch }, "vertical::abseiling");
    expect(patch).toHaveBeenCalledWith({ stageGridSkillStream: "vertical::abseiling", stageGridStage: 3 });
  });

  it("has a single-choice Skill dropdown of Skill - Stream combos, shown with radio icons", () => {
    const skillSelect = templateSource.slice(templateSource.indexOf(':value="skillStream"'), templateSource.indexOf("</v-select>", templateSource.indexOf(':value="skillStream"')));
    expect(skillSelect).toContain(':items="skillStreamOptions"');
    expect(skillSelect).toContain('@change="onSkillStreamChange"');
    expect(skillSelect).not.toContain("multiple");
    expect(skillSelect).toContain("mdi-radiobox-marked");

    const options = (OASStageGridFiltersVue as unknown as { computed: { skillStreamOptions(this: unknown): unknown } }).computed.skillStreamOptions;
    expect(options.call({ skillStreams: [{ key: "camping::camping", skill: "camping", stream: "camping", label: "Camping" }] })).toEqual([{ value: "camping::camping", text: "Camping" }]);
  });

  it("groups the Show dropdown's items under Members/Grouping subheaders", () => {
    expect(tsSource).toContain('{ header: "Members" }');
    expect(tsSource).toContain('{ header: "Grouping" }');
    expect(tsSource).toContain("{ divider: true }");
  });
});
