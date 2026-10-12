import Vue from "vue";
import OASHeatMapVueOptions from "@/pages/OasProgressionVue/components/OASHeatMapVue";
import { UNASSIGNED_PATROL } from "@/pages/OasProgression/services/filterHeatMapSections";
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
  visibleStages: number[];
  sortBy: "firstName" | "lastName" | "stageProgress";
  nameFormat?: "full" | "first" | "firstInitialLast" | "firstLastInitial" | "codename";
  selectedPatrols?: string[];
  breakByPatrol?: boolean;
  showAwarded?: boolean;
  showNotStarted?: boolean;
  showAnswered?: boolean;
  showEmptyTopStages?: boolean;
  showEmptySkillRows?: boolean;
  groupBy?: "skill" | "member" | "none";
}

/**
 * selectedPatrols now behaves like every other filter: [] means "show nothing," not "show
 * everyone" (see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md). Most of these tests
 * aren't about patrol filtering at all and use makeMember()'s default (patrol: null, i.e.
 * unassigned), so default selectedPatrols to [UNASSIGNED_PATROL] here unless a test explicitly
 * overrides it (e.g. the patrol-filtering tests themselves, which pass a real patrol name).
 */
function mountLogic(props: MountProps) {
  const ComponentClass = Vue.extend(OASHeatMapVueOptions);
  const propsWithDefaults = { selectedPatrols: [UNASSIGNED_PATROL], ...props };
  return new ComponentClass({ propsData: propsWithDefaults }) as InstanceType<typeof ComponentClass> & Record<string, unknown>;
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

  it("produces the correct cell visual state for awarded, answered-only, and untouched i-statements", () => {
    const rows = [makeRow({ inputId: "awarded-input", answered: true, awarded: true }), makeRow({ inputId: "answered-input", answered: true, awarded: false }), makeRow({ inputId: "unanswered-input", answered: false, awarded: false })];
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
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("bar-complete");
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

  // The old combined "Hide complete/not started" checkbox was split into two independent Show
  // dropdown options, inverted to positive (default-on) selections — see
  // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
  it("hides a fully-complete stage bar when showAwarded is off", () => {
    const rows = [makeRow({ inputId: "a", answered: true, awarded: true }), makeRow({ inputId: "b", answered: true, awarded: true })];
    const members = [makeMember()];

    const vm = mountLogic({
      items: rows,
      trunkStageCounts: { bushcraft: 3 },
      members,
      visibleStreams: ["bushcraft"],
      visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      sortBy: "firstName",
      showAwarded: false,
    });

    const sections = vm.sections as Array<{ patrolGroups: Array<{ members: Array<{ cells: Array<{ kind: string }> }> }> }>;
    expect(sections[0].patrolGroups[0].members[0].cells[0].kind).toBe("empty");
  });

  it("hides a not-started stage bar when showNotStarted is off, per the user's definition of 'not started' (zero answered/awarded I-Statements in that stage)", () => {
    const rows = [makeRow({ inputId: "a", answered: false, awarded: false })];
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

  // Regression test: an earlier pass wrongly let showNotStarted also suppress individual
  // unanswered squares inside a stage that has SOME progress — the user clarified "not started"
  // means only a whole stage with zero progress anywhere, never a square within an in-progress
  // stage. showNotStarted must have no effect once a stage reaches the "squares" branch.
  it("never hides individual unanswered squares inside an in-progress stage, even when showNotStarted is off", () => {
    const rows = [makeRow({ inputId: "answered", answered: true, awarded: false }), makeRow({ inputId: "unanswered", answered: false, awarded: false })];
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

    it("hides answered-but-unawarded squares in place, leaving awarded and untouched ones visible", () => {
      const rows = [makeRow({ inputId: "awarded", answered: true, awarded: true }), makeRow({ inputId: "answered", answered: true, awarded: false }), makeRow({ inputId: "untouched", answered: false, awarded: false })];

      const cell = firstCell({ ...baseProps, items: rows, showAnswered: false });

      expect(cell.kind).toBe("squares");
      // Every square survives — only the answered one's state class changes, so the visible
      // squares keep the positions they had with the filter off.
      expect((cell.squares ?? []).map((s) => s.inputId)).toEqual(["awarded", "answered", "untouched"]);
      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-awarded", "oas-heatmap-square-hidden", "oas-heatmap-square-unanswered"]);
    });

    it("leaves every square visible when on", () => {
      const rows = [makeRow({ inputId: "awarded", answered: true, awarded: true }), makeRow({ inputId: "answered", answered: true, awarded: false }), makeRow({ inputId: "untouched", answered: false, awarded: false })];

      const cell = firstCell({ ...baseProps, items: rows, showAnswered: true });

      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-awarded", "oas-heatmap-square-answered", "oas-heatmap-square-unanswered"]);
    });

    it("keeps a stage's full square count even when every one of them is hidden", () => {
      const rows = [makeRow({ inputId: "a", answered: true, awarded: false }), makeRow({ inputId: "b", answered: true, awarded: false })];

      const cell = firstCell({ ...baseProps, items: rows, showAnswered: false });

      expect(cell.kind).toBe("squares");
      expect((cell.squares ?? []).map((s) => s.stateClass)).toEqual(["oas-heatmap-square-hidden", "oas-heatmap-square-hidden"]);
    });

    it("leaves the complete bar alone — hiding answered squares must not touch the bars", () => {
      const rows = [makeRow({ inputId: "a", answered: true, awarded: true }), makeRow({ inputId: "b", answered: true, awarded: true })];

      expect(firstCell({ ...baseProps, items: rows, showAnswered: false }).kind).toBe("bar-complete");
    });

    it("leaves the not-started bar alone", () => {
      const rows = [makeRow({ inputId: "a", answered: false, awarded: false })];

      expect(firstCell({ ...baseProps, items: rows, showAnswered: false }).kind).toBe("bar-unstarted");
    });

    it("leaves group-start borders exactly where they are when squares are hidden", () => {
      // Hiding is purely visual, so the group layout must not shift: "do-a" stays the group start
      // even though the Plan square before it is now invisible.
      const rows = [
        makeRow({ inputId: "plan-a", inputGroup: "Plan", answered: true, awarded: false }),
        makeRow({ inputId: "plan-b", inputGroup: "Plan", answered: false, awarded: false }),
        makeRow({ inputId: "do-a", inputGroup: "Do", answered: false, awarded: false }),
      ];

      const groupClassesWith = (showAnswered: boolean) => (firstCell({ ...baseProps, items: rows, showAnswered }).squares ?? []).map((s) => s.groupClass);

      expect(groupClassesWith(false)).toEqual(["", "", "oas-heatmap-square-group-start"]);
      expect(groupClassesWith(false)).toEqual(groupClassesWith(true));
    });
  });

  // Surfaced in the UI as the Show dropdown's "Empty top stages" option.
  describe("showEmptyTopStages", () => {
    function stagesFor(rows: OASProgressionRow[], showEmptyTopStages: boolean): number[] {
      const vm = mountLogic({ items: rows, trunkStageCounts: { bushcraft: 9 }, members: [makeMember()], visibleStreams: ["bushcraft"], visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], sortBy: "firstName", showEmptyTopStages });
      return vm.allStages as number[];
    }

    it("trims empty top stages down to 1, keeping only stage 1 on screen", () => {
      // Progress only in stage 1, so stages 2-9 are all trimmable; 1 survives as the floor
      // (lowered from 2 to 1 — DEV_NOTES.md: "can hide empty stages down to 2, inclusively. So
      // only stage 1 must be shown").
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

  // Surfaced in the UI as the Show dropdown's "Empty skills" option.
  describe("showEmptySkillRows", () => {
    // Paddling forks into Canoeing/Kayaking after its trunk; bushcraft never forks.
    const forkedRows = [
      makeRow({ stream: "paddling", branch: "paddling", stage: 1, inputId: "trunk" }),
      makeRow({ stream: "paddling", branch: "canoeing", stage: 4, inputId: "canoe" }),
      makeRow({ stream: "paddling", branch: "kayaking", stage: 4, inputId: "kayak", answered: true }),
    ];

    function sectionTitlesFor(rows: OASProgressionRow[], visibleStreams: string[], trunkStageCounts: Record<string, number>, showEmptySkillRows: boolean): string[] {
      const vm = mountLogic({ items: rows, trunkStageCounts, members: [makeMember()], visibleStreams, visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], sortBy: "firstName", showEmptySkillRows });
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

  /**
   * Regression tests for three bugs specific to Group by Member (groupBy: "member"), which uses
   * the memberSections computed rather than sections — found via live testing and fixed
   * together, since memberSections had drifted from sections' own filtering/sorting entirely.
   * See .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
   */
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

      // Only the unassigned member should show — this is exactly the case the old hand-rolled
      // filter (section.patrolName !== null && ...) got wrong: it could never match
      // UNASSIGNED_PATROL, so an unassigned member could never be selected back in.
      expect(memberTitlesFor({ items: rows, members, selectedPatrols: [UNASSIGNED_PATROL] })).toEqual(["Sam Ranger"]);
    });

    it("shows nobody when selectedPatrols is empty, matching Group by Skill's own 'empty = show nothing' rule", () => {
      const rows = [makeRow({ memberId: "m1", memberName: "Alex Scout", patrolName: null })];
      const members = [makeMember({ id: "m1" })];

      expect(memberTitlesFor({ items: rows, members, selectedPatrols: [] })).toEqual([]);
    });

    it("sorts by first name, replacing the old fixed alphabetical-by-display-title sort", () => {
      // The displayed name comes from the Terrain member record (first_name/last_name via
      // groupRowsForHeatMap), not makeRow's own memberName field — override both there.
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

  /** The Excel export's view of the heat map (.claude/Excel/PLAN_STAGE_2.md): both layouts, as rendered. */
  describe("getExportView", () => {
    type ExportView = {
      firstColumnHeader: string;
      stages: number[];
      sections: Array<{ title: string; patrolName: string | null; groups: Array<{ patrolName: string; rows: Array<{ label: string; view: { cells: Array<{ kind: string; squares?: Array<{ state: string }> }> } }> }> }>;
    };
    const exportView = (vm: Record<string, unknown>) => (vm.getExportView as () => ExportView)();

    const rows = [makeRow({ memberId: "m1", inputId: "a", answered: true, awarded: true }), makeRow({ memberId: "m1", inputId: "b", answered: true }), makeRow({ memberId: "m1", inputId: "c" }), makeRow({ memberId: "m2", inputId: "a" })];
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
      expect((group.rows[0].view.cells[0].squares ?? []).map((s) => s.state)).toEqual(["awarded", "answered", "unanswered"]);
    });

    it("by skill with Break by patrol: one group per patrol", () => {
      const view = exportView(mountLogic({ ...base, breakByPatrol: true }));
      expect(view.sections[0].groups.map((g) => g.patrolName)).toEqual(["Eagles", "Wolves"]);
    });

    it("marks squares hidden by a Show filter as 'hidden'", () => {
      const view = exportView(mountLogic({ ...base, showAnswered: false }));
      expect((view.sections[0].groups[0].rows[0].view.cells[0].squares ?? []).map((s) => s.state)).toEqual(["awarded", "hidden", "unanswered"]);
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
