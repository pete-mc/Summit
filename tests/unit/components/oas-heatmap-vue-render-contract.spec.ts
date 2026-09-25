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

interface MountProps {
  items: OASProgressionRow[];
  trunkStageCounts: Record<string, number>;
  members: TerrainUnitMember[];
  visibleStreams: string[];
  stageRange: [number, number];
  sortBy: "firstName" | "lastName" | "stageProgress";
  useCodenames?: boolean;
  selectedPatrols?: string[];
  breakByPatrol?: boolean;
  onlyInProgress?: boolean;
  hideAnswered?: boolean;
  hideEmptyTopColumns?: boolean;
  showEmptySections?: boolean;
}

function mountLogic(props: MountProps) {
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

    const sections = vm.sections as Array<{ skill: string; title: string; patrolGroups: Array<{ members: Array<{ displayName: string }> }> }>;
    expect(sections).toHaveLength(1);
    expect(sections[0].skill).toBe("bushcraft");
    expect(sections[0].patrolGroups[0].members.map((m) => m.displayName)).toEqual(["Alex Scout", "Sam Ranger"]);
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

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string; squares?: Array<{ stateClass: string }> }> }> }> }>;
    const cell = sections[0].patrolGroups[0].members[0].cells[0];
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

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("bar-complete");
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

  it("shows a deterministic codename instead of the member's real name when useCodenames is on", () => {
    const rows = [makeRow()];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
      useCodenames: true,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ displayName: string }> }> }>;
    const displayName = sections[0].patrolGroups[0].members[0].displayName;
    expect(displayName).not.toBe("Alex Scout");
    expect(displayName).not.toBe("");
  });

  it("filters members down to selectedPatrols", () => {
    const rows = [makeRow({ patrolName: "Eagles" }), makeRow({ memberId: "member-2", memberName: "Sam Ranger", patrolName: "Wolves" })];
    const members = [makeMember({ id: "member-1", patrol: { id: "p1", name: "Eagles" } }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger", patrol: { id: "p2", name: "Wolves" } })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
      selectedPatrols: ["Eagles"],
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ displayName: string }> }> }>;
    expect(sections[0].patrolGroups[0].members.map((m) => m.displayName)).toEqual(["Alex Scout"]);
  });

  it("groups members into per-patrol groups when breakByPatrol is on", () => {
    const rows = [makeRow({ patrolName: "Eagles" }), makeRow({ memberId: "member-2", memberName: "Sam Ranger", patrolName: "Wolves" })];
    const members = [makeMember({ id: "member-1", patrol: { id: "p1", name: "Eagles" } }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger", patrol: { id: "p2", name: "Wolves" } })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
      breakByPatrol: true,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ patrolName: string; members: Array<{ displayName: string }> }> }>;
    expect(sections[0].patrolGroups.map((g) => g.patrolName)).toEqual(["Eagles", "Wolves"]);
  });

  // Surfaced in the UI as "Hide complete/not started"; the state key keeps its original name so
  // the persisted localStorage filters stay readable.
  it("hides fully-complete and not-started stage bars (but keeps in-progress squares) when onlyInProgress is on", () => {
    const rows = [makeRow({ inputId: "a", answered: true, awarded: true }), makeRow({ inputId: "b", answered: true, awarded: true })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      stageRange: [1, 9],
      sortBy: "firstName",
      onlyInProgress: true,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("empty");
  });

  describe("hideAnswered", () => {
    type CellShape = { kind: string; squares?: Array<{ inputId: string; stateClass: string; groupClass: string }> };

    function firstCell(props: MountProps): CellShape {
      const vm = mountLogic(props);
      const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: CellShape[] }> }> }>;
      return sections[0].patrolGroups[0].members[0].cells[0];
    }

    const baseProps = { trunkStageCounts: { bushcraft: 3 }, members: [makeMember()], visibleStreams: ["bushcraft"], stageRange: [1, 9] as [number, number], sortBy: "firstName" as const };

    it("hides answered-but-unawarded squares in place, leaving awarded and untouched ones visible", () => {
      const rows = [makeRow({ inputId: "awarded", answered: true, awarded: true }), makeRow({ inputId: "answered", answered: true, awarded: false }), makeRow({ inputId: "untouched", answered: false, awarded: false })];

      const cell = firstCell({ ...baseProps, items: rows, hideAnswered: true });

      expect(cell.kind).toBe("squares");
      // Every square survives — only the answered one's state class changes, so the visible
      // squares keep the positions they had with the filter off.
      expect((cell.squares ?? []).map((s) => s.inputId)).toEqual(["awarded", "answered", "untouched"]);
      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-awarded", "oas-heatmap-square-hidden", "oas-heatmap-square-unanswered"]);
    });

    it("leaves every square visible when off", () => {
      const rows = [makeRow({ inputId: "awarded", answered: true, awarded: true }), makeRow({ inputId: "answered", answered: true, awarded: false }), makeRow({ inputId: "untouched", answered: false, awarded: false })];

      const cell = firstCell({ ...baseProps, items: rows, hideAnswered: false });

      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-awarded", "oas-heatmap-square-answered", "oas-heatmap-square-unanswered"]);
    });

    it("keeps a stage's full square count even when every one of them is hidden", () => {
      const rows = [makeRow({ inputId: "a", answered: true, awarded: false }), makeRow({ inputId: "b", answered: true, awarded: false })];

      const cell = firstCell({ ...baseProps, items: rows, hideAnswered: true });

      expect(cell.kind).toBe("squares");
      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-hidden", "oas-heatmap-square-hidden"]);
    });

    it("leaves the complete bar alone — hiding answered squares must not touch the bars", () => {
      const rows = [makeRow({ inputId: "a", answered: true, awarded: true }), makeRow({ inputId: "b", answered: true, awarded: true })];

      expect(firstCell({ ...baseProps, items: rows, hideAnswered: true }).kind).toBe("bar-complete");
    });

    it("leaves the not-started bar alone", () => {
      const rows = [makeRow({ inputId: "a", answered: false, awarded: false })];

      expect(firstCell({ ...baseProps, items: rows, hideAnswered: true }).kind).toBe("bar-unstarted");
    });

    it("leaves group-start borders exactly where they are when squares are hidden", () => {
      // Hiding is purely visual, so the group layout must not shift: "do-a" stays the group start
      // even though the Plan square before it is now invisible.
      const rows = [
        makeRow({ inputId: "plan-a", inputGroup: "Plan", answered: true, awarded: false }),
        makeRow({ inputId: "plan-b", inputGroup: "Plan", answered: false, awarded: false }),
        makeRow({ inputId: "do-a", inputGroup: "Do", answered: false, awarded: false }),
      ];

      const groupClassesWith = (hideAnswered: boolean) => (firstCell({ ...baseProps, items: rows, hideAnswered }).squares ?? []).map((s) => s.groupClass);

      expect(groupClassesWith(true)).toEqual(["", "", "oas-heatmap-square-group-start"]);
      expect(groupClassesWith(true)).toEqual(groupClassesWith(false));
    });
  });

  // Surfaced in the UI as "Hide empty top stages".
  describe("hideEmptyTopColumns", () => {
    function stagesFor(rows: OASProgressionRow[], hideEmptyTopColumns: boolean): number[] {
      const vm = mountLogic({ items: rows, trunkStageCounts: { bushcraft: 9 }, members: [makeMember()], visibleStreams: ["bushcraft"], stageRange: [1, 9], sortBy: "firstName", hideEmptyTopColumns });
      return vm.allStages as number[];
    }

    it("trims empty top stages down to 2, keeping stages 1 and 2 on screen", () => {
      // Progress only in stage 1, so stages 3-9 are all trimmable; 2 survives as the floor.
      const rows = [makeRow({ stage: 1, inputId: "s1", answered: true }), ...[2, 3, 4, 5, 6, 7, 8, 9].map((stage) => makeRow({ stage, inputId: "s" + stage }))];

      expect(stagesFor(rows, true)).toEqual([1, 2]);
    });

    it("stops trimming at the highest stage with progress", () => {
      const rows = [makeRow({ stage: 1, inputId: "s1", answered: true }), makeRow({ stage: 5, inputId: "s5", answered: true }), ...[2, 3, 4, 6, 7, 8, 9].map((stage) => makeRow({ stage, inputId: "s" + stage }))];

      expect(stagesFor(rows, true)).toEqual([1, 2, 3, 4, 5]);
    });

    it("leaves every stage in place when off", () => {
      const rows = [makeRow({ stage: 1, inputId: "s1", answered: true }), ...[2, 3, 4, 5, 6, 7, 8, 9].map((stage) => makeRow({ stage, inputId: "s" + stage }))];

      expect(stagesFor(rows, false)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  // Surfaced in the UI as "Hide empty skills"; driven by showEmptySections (its inverse).
  describe("hideEmptyStreams", () => {
    // Paddling forks into Canoeing/Kayaking after its trunk; bushcraft never forks.
    const forkedRows = [
      makeRow({ stream: "paddling", branch: "paddling", stage: 1, inputId: "trunk" }),
      makeRow({ stream: "paddling", branch: "canoeing", stage: 4, inputId: "canoe" }),
      makeRow({ stream: "paddling", branch: "kayaking", stage: 4, inputId: "kayak", answered: true }),
    ];

    function sectionTitlesFor(rows: OASProgressionRow[], visibleStreams: string[], trunkStageCounts: Record<string, number>, showEmptySections: boolean): string[] {
      const vm = mountLogic({ items: rows, trunkStageCounts, members: [makeMember()], visibleStreams, stageRange: [1, 9], sortBy: "firstName", showEmptySections });
      return (vm.sections as Array<{ title: string }>).map((s) => s.title);
    }

    it("hides an empty stream while keeping one with progress", () => {
      const titles = sectionTitlesFor(forkedRows, ["paddling"], { paddling: 3 }, false);

      expect(titles).toContain("Paddling — Kayaking");
      expect(titles).not.toContain("Paddling — Canoeing");
    });

    it("hides an entirely empty skill, trunk section included", () => {
      // bushcraft has no progress anywhere, so nothing of it should survive -- the trunk section
      // is no longer exempt the way the React page leaves it.
      const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 1, inputId: "bc" }), makeRow({ stream: "camping", branch: "camping", stage: 1, inputId: "cp", answered: true })];

      const titles = sectionTitlesFor(rows, ["bushcraft", "camping"], { bushcraft: 3, camping: 3 }, false);

      expect(titles).toEqual(["Camping"]);
    });

    it("keeps an empty skill's trunk when the filter is off", () => {
      const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 1, inputId: "bc" }), makeRow({ stream: "camping", branch: "camping", stage: 1, inputId: "cp", answered: true })];

      const titles = sectionTitlesFor(rows, ["bushcraft", "camping"], { bushcraft: 3, camping: 3 }, true);

      expect(titles).toEqual(["Bushcraft", "Camping"]);
    });

    it("keeps a skill whose trunk is empty but whose stream has progress", () => {
      // The trunk itself is empty here, but the skill must not vanish -- Kayaking has progress.
      const titles = sectionTitlesFor(forkedRows, ["paddling"], { paddling: 3 }, false);

      expect(titles.length).toBeGreaterThan(0);
      expect(titles).toContain("Paddling — Kayaking");
    });
  });
});
