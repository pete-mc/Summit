// Gotcha: Jest can't parse .vue files, so stub the child.
jest.mock("@/pages/OasProgressVue/components/OASTabJumpMenu.vue", () => ({ __esModule: true, default: { name: "OASTabJumpMenu", render: () => null } }), { virtual: true });

import Vue from "vue";
import OASHeatMapVueOptions from "@/pages/OasProgressVue/components/OASHeatMapVue";
import { UNASSIGNED_PATROL } from "@/pages/OasProgress/services/filterHeatMapSections";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

/** Learning: Jest has no .vue transform, so the options object is tested directly with `new Vue(options)`. */

function makeRow(overrides: Partial<OASProgressRow> = {}): OASProgressRow {
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
    approved: false,
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
  items: OASProgressRow[];
  trunkStageCounts: Record<string, number>;
  members: TerrainUnitMember[];
  visibleStreams: string[];
  visibleStages: number[];
  sortBy: "firstName" | "lastName" | "stageProgress";
  nameFormat?: "full" | "first" | "firstInitialLast" | "firstLastInitial" | "codename";
  selectedPatrols?: string[];
  breakByPatrol?: boolean;
  showApproved?: boolean;
  showNotStarted?: boolean;
  showAnswered?: boolean;
  showEmptySkillRows?: boolean;
  groupBy?: "skill" | "member" | "none";
  canOpenPeakAward?: boolean;
}

/** [] shows nobody, so default to [UNASSIGNED_PATROL] (makeMember's default) unless a test overrides it. */
function mountLogic(props: MountProps) {
  const ComponentClass = Vue.extend(OASHeatMapVueOptions);
  const propsWithDefaults = { selectedPatrols: [UNASSIGNED_PATROL], ...props };
  return new ComponentClass({ propsData: propsWithDefaults }) as InstanceType<typeof ComponentClass> & Record<string, unknown>;
}

describe("OASHeatMapVue render contract", () => {
  it("groups rows into sections and renders member display data, matching groupRowsForHeatMap's own output shape", () => {
    const rows = [makeRow({ approved: true, answered: true, date: "2020-01-01" }), makeRow({ memberId: "member-2", memberName: "Sam Ranger", inputId: "def456", approved: false, answered: false, date: null })];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger" })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ skill: string }>;
    expect(sections.map((s) => s.skill)).toEqual(["bushcraft"]);
  });

  it("produces the correct cell visual state for approved, answered-only, and untouched i-statements", () => {
    const rows = [makeRow({ inputId: "approved-input", answered: true, approved: true }), makeRow({ inputId: "answered-input", answered: true, approved: false }), makeRow({ inputId: "unanswered-input", answered: false, approved: false })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string; squares?: Array<{ stateClass: string }> }> }> }> }>;
    const cell = sections[0].patrolGroups[0].members[0].cells[0];
    expect(cell.kind).toBe("squares");
    const stateClasses = (cell.squares ?? []).map((s) => s.stateClass);
    expect(stateClasses).toContain("oas-heatmap-square-approved");
    expect(stateClasses).toContain("oas-heatmap-square-answered");
    expect(stateClasses).toContain("oas-heatmap-square-unanswered");
  });

  it("renders a solid approved bar when every i-statement in a stage is approved", () => {
    const rows = [makeRow({ inputId: "a", answered: true, approved: true }), makeRow({ inputId: "b", answered: true, approved: true })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("bar-approved");
  });

  it("slices columns to the requested visibleStages", () => {
    const rows = [makeRow({ stage: 1 }), makeRow({ stage: 5, memberId: "member-1", inputId: "stage5" })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 5 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2],
      sortBy: "firstName",
    });

    expect(vm.allStages).toEqual([1, 2]);
  });

  it("slices columns to a true multi-select, not a contiguous range — non-adjacent stages show only those stages", () => {
    const rows = [makeRow({ stage: 1, inputId: "stage1" }), makeRow({ stage: 3, inputId: "stage3" }), makeRow({ stage: 5, inputId: "stage5" })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 5 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 5],
      sortBy: "firstName",
    });

    expect(vm.allStages).toEqual([1, 5]);
  });

  it("shows a deterministic codename instead of the member's real name when nameFormat is codename", () => {
    const rows = [makeRow()];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" })];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
      nameFormat: "codename",
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
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
      breakByPatrol: true,
      selectedPatrols: ["Eagles", "Wolves"],
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ patrolName: string; members: Array<{ displayName: string }> }> }>;
    expect(sections[0].patrolGroups.map((g) => g.patrolName)).toEqual(["Eagles", "Wolves"]);
  });

  it("hides a fully-approved stage bar when showApproved is off", () => {
    const rows = [makeRow({ inputId: "a", answered: true, approved: true }), makeRow({ inputId: "b", answered: true, approved: true })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
      showApproved: false,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("empty");
  });

  it("hides a not-started stage bar when showNotStarted is off, per the user's definition of 'not started' (zero answered/approved I-Statements in that stage)", () => {
    const rows = [makeRow({ inputId: "a", answered: false, approved: false })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
      showNotStarted: false,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("empty");
  });

  // Regression: showNotStarted must not hide squares inside a stage that has some progress.
  it("never hides individual unanswered squares inside an in-progress stage, even when showNotStarted is off", () => {
    const rows = [makeRow({ inputId: "answered", answered: true, approved: false }), makeRow({ inputId: "unanswered", answered: false, approved: false })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
      showNotStarted: false,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string; squares?: Array<{ stateClass: string }> }> }> }> }>;
    const cell = sections[0].patrolGroups[0].members[0].cells[0];
    expect(cell.kind).toBe("squares");
    expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-answered", "oas-heatmap-square-unanswered"]);
  });

  describe("showAnswered (off hides answered-but-unawarded squares)", () => {
    type CellShape = { kind: string; squares?: Array<{ inputId: string; stateClass: string; groupClass: string }> };

    function firstCell(props: MountProps): CellShape {
      const vm = mountLogic(props);
      const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: CellShape[] }> }> }>;
      return sections[0].patrolGroups[0].members[0].cells[0];
    }

    const baseProps = { trunkStageCounts: { bushcraft: 3 }, members: [makeMember()], visibleStreams: ["bushcraft"], visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9] as [number, number], sortBy: "firstName" as const };

    it("hides answered-but-unawarded squares in place, leaving approved and untouched ones visible", () => {
      const rows = [makeRow({ inputId: "approved", answered: true, approved: true }), makeRow({ inputId: "answered", answered: true, approved: false }), makeRow({ inputId: "untouched", answered: false, approved: false })];

      const cell = firstCell({ ...baseProps, items: rows, showAnswered: false });

      expect(cell.kind).toBe("squares");
      expect((cell.squares ?? []).map((s) => s.inputId)).toEqual(["approved", "answered", "untouched"]);
      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-approved", "oas-heatmap-square-hidden", "oas-heatmap-square-unanswered"]);
    });

    it("leaves every square visible when on", () => {
      const rows = [makeRow({ inputId: "approved", answered: true, approved: true }), makeRow({ inputId: "answered", answered: true, approved: false }), makeRow({ inputId: "untouched", answered: false, approved: false })];

      const cell = firstCell({ ...baseProps, items: rows, showAnswered: true });

      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-approved", "oas-heatmap-square-answered", "oas-heatmap-square-unanswered"]);
    });

    it("keeps a stage's full square count even when every one of them is hidden", () => {
      const rows = [makeRow({ inputId: "a", answered: true, approved: false }), makeRow({ inputId: "b", answered: true, approved: false })];

      const cell = firstCell({ ...baseProps, items: rows, showAnswered: false });

      expect(cell.kind).toBe("squares");
      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-hidden", "oas-heatmap-square-hidden"]);
    });

    it("leaves the approved bar alone — hiding answered squares must not touch the bars", () => {
      const rows = [makeRow({ inputId: "a", answered: true, approved: true }), makeRow({ inputId: "b", answered: true, approved: true })];

      expect(firstCell({ ...baseProps, items: rows, showAnswered: false }).kind).toBe("bar-approved");
    });

    it("leaves the not-started bar alone", () => {
      const rows = [makeRow({ inputId: "a", answered: false, approved: false })];

      expect(firstCell({ ...baseProps, items: rows, showAnswered: false }).kind).toBe("bar-unstarted");
    });

    it("leaves group-start borders exactly where they are when squares are hidden", () => {
      // Hiding is visual only: the group start must not move.
      const rows = [
        makeRow({ inputId: "plan-a", inputGroup: "Plan", answered: true, approved: false }),
        makeRow({ inputId: "plan-b", inputGroup: "Plan", answered: false, approved: false }),
        makeRow({ inputId: "do-a", inputGroup: "Do", answered: false, approved: false }),
      ];

      const groupClassesWith = (showAnswered: boolean) => (firstCell({ ...baseProps, items: rows, showAnswered }).squares ?? []).map((s) => s.groupClass);

      expect(groupClassesWith(false)).toEqual(["", "", "oas-heatmap-square-group-start"]);
      expect(groupClassesWith(false)).toEqual(groupClassesWith(true));
    });
  });

  describe("showNotStarted trims stage columns", () => {
    function stagesFor(rows: OASProgressRow[], showNotStarted: boolean): number[] {
      const vm = mountLogic({ items: rows, trunkStageCounts: { bushcraft: 9 }, members: [makeMember()], visibleStreams: ["bushcraft"], visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], sortBy: "firstName", showNotStarted });
      return vm.allStages as number[];
    }

    it("trims stages nobody has started down to 1, keeping only stage 1 on screen", () => {
      const rows = [makeRow({ stage: 1, inputId: "s1", answered: true }), ...[2, 3, 4, 5, 6, 7, 8, 9].map((stage) => makeRow({ stage, inputId: "s" + stage }))];

      expect(stagesFor(rows, false)).toEqual([1]);
    });

    it("stops trimming at the highest stage with progress", () => {
      const rows = [makeRow({ stage: 1, inputId: "s1", answered: true }), makeRow({ stage: 5, inputId: "s5", answered: true }), ...[2, 3, 4, 6, 7, 8, 9].map((stage) => makeRow({ stage, inputId: "s" + stage }))];

      expect(stagesFor(rows, false)).toEqual([1, 2, 3, 4, 5]);
    });

    it("leaves every stage in place when on", () => {
      const rows = [makeRow({ stage: 1, inputId: "s1", answered: true }), ...[2, 3, 4, 5, 6, 7, 8, 9].map((stage) => makeRow({ stage, inputId: "s" + stage }))];

      expect(stagesFor(rows, true)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe("showEmptySkillRows", () => {
    const forkedRows = [
      makeRow({ stream: "paddling", branch: "paddling", stage: 1, inputId: "trunk" }),
      makeRow({ stream: "paddling", branch: "canoeing", stage: 4, inputId: "canoe" }),
      makeRow({ stream: "paddling", branch: "kayaking", stage: 4, inputId: "kayak", answered: true }),
    ];

    function sectionTitlesFor(rows: OASProgressRow[], visibleStreams: string[], trunkStageCounts: Record<string, number>, showEmptySkillRows: boolean): string[] {
      const vm = mountLogic({ items: rows, trunkStageCounts, members: [makeMember()], visibleStreams, visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], sortBy: "firstName", showEmptySkillRows });
      return (vm.sections as Array<{ title: string }>).map((s) => s.title);
    }

    it("hides an empty stream while keeping one with progress", () => {
      const titles = sectionTitlesFor(forkedRows, ["paddling"], { paddling: 3 }, false);

      expect(titles).toContain("Paddling — Kayaking");
      expect(titles).not.toContain("Paddling — Canoeing");
    });

    it("hides an entirely empty skill, trunk section included", () => {
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
      const titles = sectionTitlesFor(forkedRows, ["paddling"], { paddling: 3 }, false);

      expect(titles.length).toBeGreaterThan(0);
      expect(titles).toContain("Paddling — Kayaking");
    });
  });

  /** Regression: memberSections had drifted from sections' filtering and sorting. */
  describe("memberSections (Group by Member)", () => {
    function memberTitlesFor(props: Partial<MountProps> & Pick<MountProps, "items" | "members">): string[] {
      const vm = mountLogic({
        trunkStageCounts: { bushcraft: 3 },
        visibleStreams: ["bushcraft"],
        visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        sortBy: "firstName",
        groupBy: "member",
        ...props,
      } as MountProps);
      return (vm.memberSections as Array<{ title: string }>).map((s) => s.title);
    }

    it("filters by selectedPatrols the same way sections (Group by Skill) does, including UNASSIGNED_PATROL for unassigned members", () => {
      const rows = [makeRow({ memberId: "m1", memberName: "Alex Scout", patrolName: "Eagles" }), makeRow({ memberId: "m2", memberName: "Sam Ranger", patrolName: null, inputId: "b" })];
      const members = [makeMember({ id: "m1", patrol: { id: "p1", name: "Eagles" } }), makeMember({ id: "m2", first_name: "Sam", last_name: "Ranger", patrol: null })];

      // Regression: the old hand-rolled filter could never match UNASSIGNED_PATROL.
      expect(memberTitlesFor({ items: rows, members, selectedPatrols: [UNASSIGNED_PATROL] })).toEqual(["Sam Ranger"]);
    });

    it("shows nobody when selectedPatrols is empty, matching Group by Skill's own 'empty = show nothing' rule", () => {
      const rows = [makeRow({ memberId: "m1", memberName: "Alex Scout", patrolName: null })];
      const members = [makeMember({ id: "m1" })];

      expect(memberTitlesFor({ items: rows, members, selectedPatrols: [] })).toEqual([]);
    });

    it("sorts by first name, replacing the old fixed alphabetical-by-display-title sort", () => {
      const rows = [makeRow({ memberId: "m1", patrolName: null }), makeRow({ memberId: "m2", patrolName: null, inputId: "b" })];
      const members = [makeMember({ id: "m1", first_name: "Zara", last_name: "Adams" }), makeMember({ id: "m2", first_name: "Amy", last_name: "Zebra" })];

      expect(memberTitlesFor({ items: rows, members, selectedPatrols: [UNASSIGNED_PATROL], sortBy: "firstName" })).toEqual(["Amy Zebra", "Zara Adams"]);
    });

    it("sorts by last name when requested", () => {
      const rows = [makeRow({ memberId: "m1", patrolName: null }), makeRow({ memberId: "m2", patrolName: null, inputId: "b" })];
      const members = [makeMember({ id: "m1", first_name: "Amy", last_name: "Adams" }), makeMember({ id: "m2", first_name: "Zara", last_name: "Young" })];

      expect(memberTitlesFor({ items: rows, members, selectedPatrols: [UNASSIGNED_PATROL], sortBy: "lastName" })).toEqual(["Amy Adams", "Zara Young"]);
    });
  });

  describe("getExportView", () => {
    type ExportView = {
      firstColumnHeader: string;
      stages: number[];
      sections: Array<{ title: string; patrolName: string | null; groups: Array<{ patrolName: string; rows: Array<{ label: string; view: { cells: Array<{ kind: string; squares?: Array<{ state: string }> }> } }> }> }>;
    };
    const exportView = (vm: Record<string, unknown>) => (vm.getExportView as () => ExportView)();

    const rows = [makeRow({ memberId: "m1", inputId: "a", answered: true, approved: true }), makeRow({ memberId: "m1", inputId: "b", answered: true }), makeRow({ memberId: "m1", inputId: "c" }), makeRow({ memberId: "m2", inputId: "a" })];
    const members = [makeMember({ id: "m1", first_name: "Alex", last_name: "Scout", patrol: { id: "p1", name: "Eagles" } }), makeMember({ id: "m2", first_name: "Sam", last_name: "Ranger", patrol: { id: "p2", name: "Wolves" } })];
    const base = { items: rows, members, trunkStageCounts: { bushcraft: 3 }, visibleStreams: ["bushcraft"], visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], sortBy: "firstName" as const, selectedPatrols: ["Eagles", "Wolves"] };

    it("by skill: Member column, one row per member, square states as rendered", () => {
      const view = exportView(mountLogic(base));
      expect(view.firstColumnHeader).toBe("Member");
      expect(view.stages[0]).toBe(1);
      expect(view.sections.map((s) => s.title)).toEqual(["Bushcraft"]);
      const group = view.sections[0].groups[0];
      expect(group.patrolName).toBe("");
      expect(group.rows.map((r) => r.label)).toEqual(["Alex Scout", "Sam Ranger"]);
      expect((group.rows[0].view.cells[0].squares ?? []).map((s) => s.state)).toEqual(["approved", "answered", "unanswered"]);
    });

    it("by skill with Break by patrol: one group per patrol", () => {
      const view = exportView(mountLogic({ ...base, breakByPatrol: true }));
      expect(view.sections[0].groups.map((g) => g.patrolName)).toEqual(["Eagles", "Wolves"]);
    });

    it("marks squares hidden by a Show filter as 'hidden'", () => {
      const view = exportView(mountLogic({ ...base, showAnswered: false }));
      expect((view.sections[0].groups[0].rows[0].view.cells[0].squares ?? []).map((s) => s.state)).toEqual(["approved", "hidden", "unanswered"]);
    });

    it("by member: Skill column, a section per member carrying their patrol", () => {
      const view = exportView(mountLogic({ ...base, groupBy: "member" }));
      expect(view.firstColumnHeader).toBe("Skill");
      expect(view.sections.map((s) => [s.title, s.patrolName])).toEqual([
        ["Alex Scout", "Eagles"],
        ["Sam Ranger", "Wolves"],
      ]);
      expect(view.sections[0].groups[0].rows.map((r) => r.label)).toEqual(["Bushcraft"]);
    });
  });
});

describe("OASHeatMapVue tab jumps", () => {
  // Alex: Bushcraft stage 1 approved, stage 2 started, stage 3 not started. Sam: stage 1 not started.
  const items = [
    makeRow({ stage: 1, inputId: "s1", answered: true, approved: true }),
    makeRow({ stage: 2, inputId: "s2a", answered: true }),
    makeRow({ stage: 2, inputId: "s2b" }),
    makeRow({ stage: 3, inputId: "s3" }),
    makeRow({ memberId: "member-2", memberName: "Sam Ranger", stage: 1, inputId: "s1" }),
  ];
  const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger" })];
  const baseProps = { items, trunkStageCounts: { bushcraft: 3 }, members, visibleStreams: ["bushcraft"], visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], sortBy: "firstName" as const };

  type Jump = { viewMode: string; filters: Record<string, unknown> } | null;
  type Row = { memberId: string; stageJump: Jump; cellJumps: Jump[]; menu: Array<NonNullable<Jump>> };

  it("grouped by skill: stage cells open that exact stage, approved ones are not links", () => {
    const vm = mountLogic({ ...baseProps, canOpenPeakAward: true } as MountProps);
    const alex = (vm.sections as Array<{ patrolGroups: Array<{ members: Row[] }> }>)[0].patrolGroups[0].members[0];

    expect(alex.cellJumps.slice(0, 3).map((j) => j && j.filters.nextStepsStage)).toEqual([null, 2, 3]);
    expect(alex.cellJumps[0]).toBeNull();
    expect(alex.stageJump?.filters).toEqual({ nextStepsMemberId: "member-1", nextStepsSkillStream: "bushcraft::bushcraft", nextStepsStage: null });
    expect(alex.menu.map((j) => j.viewMode)).toEqual(["summary", "peakAward"]);
    expect(alex.menu[0].filters.summaryMemberFilter).toBe("Alex Scout");
  });

  it("grouped by skill: the section opens Stage Grid at the lowest stage any shown member needs", () => {
    const vm = mountLogic(baseProps);
    const [section] = vm.sections as Array<{ menu: Array<NonNullable<Jump>> }>;

    expect(section.menu.map((j) => [j.viewMode, j.filters.stageGridStage])).toEqual([["stageGrid", 1]]);
  });

  it("grouped by member: the Skill - Stream opens Stage Grid at that member's next stage, the member opens Summary", () => {
    const vm = mountLogic({ ...baseProps, groupBy: "member" });
    const alex = (vm.memberSections as Array<{ memberId: string; menu: Array<NonNullable<Jump>>; skillRows: Row[] }>).find((s) => s.memberId === "member-1");

    expect(alex?.skillRows[0].menu.map((j) => [j.viewMode, j.filters.stageGridStage])).toEqual([["stageGrid", 2]]);
    expect(alex?.menu.map((j) => j.viewMode)).toEqual(["summary"]);
    expect(alex?.skillRows[0].cellJumps[1]?.filters.nextStepsStage).toBe(2);
  });
});
