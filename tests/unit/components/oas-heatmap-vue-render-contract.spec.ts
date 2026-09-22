import Vue from "vue";
import OASHeatMapVueOptions from "@/pages/OasProgressionVue/components/OASHeatMapVue";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

/**
 * Tests OASHeatMapVue's `computed` logic directly (Vue 2 options objects are plain JS/TS, so
 * they can be instantiated with `new Vue(options)` without a template or DOM mount) — this
 * project's Jest config has no `.vue` transform/`@vue/test-utils` (see
 * PLAN_VUESTAGE_1.md's "Deviations" note), so this mirrors that same source-level testing
 * approach rather than adding new test infrastructure mid-build.
 */

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can do a thing",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: false,
    awarded: false,
    date: null,
    ...overrides,
  };
}

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function mountLogic(props: { items: OASProgressionRow[]; trunkStageCounts: Record<string, number>; members: TerrainUnitMember[]; visibleStreams: string[]; stageRange: [number, number]; sortBy: "firstName" | "lastName" | "stageProgress" }) {
  const ComponentClass = Vue.extend(OASHeatMapVueOptions);
  return new ComponentClass({ propsData: props }) as InstanceType<typeof ComponentClass> & Record<string, unknown>;
}

describe("OASHeatMapVue render contract", () => {
  it("groups rows into sections and renders member display data, matching groupRowsForHeatMap's own output shape", () => {
    const rows = [makeRow({ awarded: true, answered: true, date: "2020-01-01" }), makeRow({ memberId: "member-2", memberName: "Sam Ranger", inputId: "def456", awarded: false, answered: false, date: null })];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger" })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ skill: string; title: string; members: Array<{ displayName: string }> }>;
    expect(sections).toHaveLength(1);
    expect(sections[0].skill).toBe("bushcraft");
    expect(sections[0].members.map((m) => m.displayName)).toEqual(["Alex Scout", "Sam Ranger"]);
  });

  it("filters sections down to visibleStreams", () => {
    const rows = [makeRow({ stream: "bushcraft" }), makeRow({ stream: "camping", memberId: "member-2" })];
    const members = [makeMember({ id: "member-1" }), makeMember({ id: "member-2" })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3, camping: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ skill: string }>;
    expect(sections.map((s) => s.skill)).toEqual(["bushcraft"]);
  });

  it("produces the correct cell visual state for awarded, answered-only, and untouched i-statements", () => {
    const rows = [makeRow({ inputId: "awarded-input", answered: true, awarded: true }), makeRow({ inputId: "answered-input", answered: true, awarded: false }), makeRow({ inputId: "unanswered-input", answered: false, awarded: false })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ members: Array<{ cells: Array<{ kind: string; squares?: Array<{ stateClass: string }> }> }> }>;
    const cell = sections[0].members[0].cells[0];
    expect(cell.kind).toBe("squares");
    const stateClasses = (cell.squares ?? []).map((s) => s.stateClass);
    expect(stateClasses).toContain("oas-heatmap-square-awarded");
    expect(stateClasses).toContain("oas-heatmap-square-answered");
    expect(stateClasses).toContain("oas-heatmap-square-unanswered");
  });

  it("renders a solid complete bar when every i-statement in a stage is awarded", () => {
    const rows = [makeRow({ inputId: "a", answered: true, awarded: true }), makeRow({ inputId: "b", answered: true, awarded: true })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ members: Array<{ cells: Array<{ kind: string }> }> }>;
    expect(sections[0].members[0].cells[0].kind).toBe("bar-complete");
  });

  it("slices columns to the requested stageRange", () => {
    const rows = [makeRow({ stage: 1 }), makeRow({ stage: 5, memberId: "member-1", inputId: "stage5" })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 5 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 2],
      sortBy: "firstName",
    });

    expect(vm.allStages).toEqual([1, 2]);
  });
});
